import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { createEffect, JSXElement } from "solid-js";
import { jwtStore, setNativeSecret, setSignatureStatus } from "../stores/jwtStore";
import { SignatureStatusValues } from "./Signature";

export function SecretInputParanoidMode(): JSXElement {
    listen("native_secret_set", (event) => {
        setNativeSecret(event.payload as boolean);
    });

    async function verifySignatureNativeSecret(jwt: string | null, hasNativeSecret: Date | null): Promise<void> {
        if (jwt === null || !hasNativeSecret) {
            setSignatureStatus("Unknown");
            return;
        }

        const valid = (await invoke("validate_jwt_native_secret", {
            token: jwt,
        })) as boolean | undefined;

        let status: SignatureStatusValues;

        if (typeof valid === "boolean") {
            status = valid ? "Valid" : "Invalid";
        } else {
            status = "Unknown";
        }

        setSignatureStatus(status);
    }

    async function open_native_window() {
        await invoke("open_native_window");
    }

    async function forget_native_secret() {
        invoke("forget_secret");
    }

    createEffect(() => {
        verifySignatureNativeSecret(jwtStore.jwt?.encoded ?? null, jwtStore.nativeSecret);
    });

    return (
        <div class="form-control w-full">
            <label class="label mt-2">
                <span class="label-text">HMAC with SHA-256 Secret</span>
            </label>
            <label class="input-group">
                <span>Secret {jwtStore.nativeSecret ? "set" : "unset"}</span>
                <button class="btn-primary btn" onClick={open_native_window}>
                    Set with Native Window
                </button>
                <button class="btn-warning btn" onClick={forget_native_secret}>
                    Forget
                </button>
            </label>
        </div>
    );
}
