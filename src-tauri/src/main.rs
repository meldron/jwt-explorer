#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    collections::{HashMap, HashSet},
    process::exit,
    sync::{Arc, Mutex},
};

use tauri::{
    AppHandle, CustomMenuItem, Manager, State, SystemTray, SystemTrayEvent, SystemTrayMenu,
};
use tauri_egui::{eframe, egui};

use jsonwebtoken::{decode, DecodingKey, Validation};

struct MyState {
    secret: Mutex<Option<String>>,
}

struct LoginApp {
    password: String,
    on_submit: Arc<dyn Fn(&str) + Send + Sync>,
}

impl LoginApp {
    fn new(_ctx: &eframe::CreationContext, on_submit: Arc<dyn Fn(&str) + Send + Sync>) -> Self {
        Self {
            password: "".into(),
            on_submit,
        }
    }
}

impl eframe::App for LoginApp {
    fn update(&mut self, ctx: &egui::Context, frame: &mut eframe::Frame) {
        let LoginApp {
            password,
            on_submit,
        } = self;
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.label("Enter your Secret");
            let textfield = ui.add_sized(
                [ui.available_width(), 25.],
                egui::TextEdit::singleline(password).password(true),
            );
            let button = ui.button("Submit");
            if (textfield.lost_focus() && ui.input().key_pressed(egui::Key::Enter))
                || button.clicked()
            {
                on_submit(password);
                frame.close();
            }
        });
    }
}

#[tauri::command]
fn validate_jwt_native_secret(token: &str, state: State<'_, MyState>) -> Option<bool> {
    let secret = state.secret.lock().unwrap().clone();

    match secret {
        Some(s) => Some(validate_jwt(token, &s)),
        None => None,
    }
}

#[tauri::command]
fn validate_jwt(token: &str, secret: &str) -> bool {
    let mut validation = Validation::default();
    validation.required_spec_claims = HashSet::new();
    validation.validate_exp = false;
    validation.validate_nbf = false;

    let token = decode::<HashMap<String, serde_json::Value>>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &validation,
    );

    match token {
        Ok(_) => true,
        _ => false,
    }
}

#[tauri::command]
async fn open_native_window(
    app: AppHandle,
    egui_handle: State<'_, tauri_egui::EguiPluginHandle>,
) -> Result<(), ()> {
    let native_options = eframe::NativeOptions {
        drag_and_drop_support: true,
        initial_window_size: Some([300.0, 85.0].into()),
        ..Default::default()
    };

    let _window = egui_handle
        .create_window(
            "native-window".to_string(),
            Box::new(|cc| {
                Box::new(LoginApp::new(
                    cc,
                    Arc::new(move |secret| {
                        let app = app.clone();
                        let state = app.state::<MyState>();
                        let mut state_secret = state.secret.lock().unwrap();

                        *state_secret = match secret.len() {
                            0 => None,
                            _ => Some(secret.to_owned()),
                        };

                        app.get_window("main")
                            .unwrap()
                            .emit("native_secret_set", state_secret.is_some())
                            .unwrap();
                    }),
                ))
            }),
            "Secret".into(),
            native_options,
        )
        .unwrap();

    Ok(())
}

#[tauri::command]
async fn show_main(window: tauri::Window) {
    window.get_window("main").unwrap().show().unwrap();
}

#[tauri::command]
async fn forget_secret(app: AppHandle) {
    let state = app.state::<MyState>();
    let mut secret = state.secret.lock().unwrap();
    *secret = None;

    app.get_window("main")
        .unwrap()
        .emit("native_secret_set", false)
        .unwrap();
}

fn create_system_tray_menu() -> SystemTrayMenu {
    let reset = CustomMenuItem::new("reset".to_string(), "Reset");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    SystemTrayMenu::new()
        .add_item(reset)
        .add_item(hide)
        .add_item(quit)
}

fn on_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let item_handle = app.tray_handle().get_item(&id);
            match id.as_str() {
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    let window_is_visible = window.is_visible().unwrap();
                    if window_is_visible {
                        window.hide().unwrap();
                        item_handle.set_title("Show").unwrap();
                    } else {
                        window.show().unwrap();
                        item_handle.set_title("Hide").unwrap();
                    }
                }
                "reset" => {
                    let state = app.state::<MyState>();
                    let mut state_secret = state.secret.lock().unwrap();
                    *state_secret = None;
                    app.get_window("main").unwrap().emit("reset", true).unwrap();
                }
                "quit" => exit(0),
                _ => {}
            }
        }
        _ => {}
    }
}

fn main() {
    let tray_menu = create_system_tray_menu();
    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .manage(MyState {
            secret: Mutex::new(None),
        })
        .system_tray(tray)
        .on_system_tray_event(on_system_tray_event)
        .invoke_handler(tauri::generate_handler![
            validate_jwt,
            show_main,
            open_native_window,
            forget_secret,
            validate_jwt_native_secret
        ])
        .setup(|app| {
            app.wry_plugin(tauri_egui::EguiPluginBuilder::new(app.handle()));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
