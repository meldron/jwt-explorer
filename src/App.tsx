import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { createEffect } from "solid-js";
import "./App.css";
import { JwtHeader } from "./components/JwtHeader";
import { JwtInput } from "./components/JwtInput";
import { Payload } from "./components/Payload";
import { Signature } from "./components/Signature";
import { resetStore } from "./stores/jwtStore";

function App() {
    listen("reset", () => {
        resetStore();
    });

    createEffect(() => {
        invoke("show_main");
    });

    return (
        <div class="mx-10 mt-10 grid grid-rows-1">
            <div class="container grid grid-cols-2 gap-24">
                <div class="container grid-rows-1 break-words">
                    <h1 class="mb-4 text-2xl">JWT Explorer</h1>
                    <JwtInput />
                    <JwtHeader />
                </div>
                <Payload />
            </div>
            <Signature />
        </div>
    );
}

export default App;
