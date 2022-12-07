import { invoke } from "@tauri-apps/api";
import { BaseDirectory, createDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { sendNotification } from "@tauri-apps/api/notification";
import { appDir } from "@tauri-apps/api/path";
import { createEffect, JSXElement } from "solid-js";
import { jwtStore, setSecret, setSignatureStatus } from "../stores/jwtStore";

export function SecretInput(): JSXElement {
    async function verifySignature(jwt: string | null, secret: string): Promise<void> {
        if (jwt === null || secret.length === 0) {
            setSignatureStatus("Unknown");
            return;
        }

        const valid = (await invoke("validate_jwt", {
            token: jwt,
            secret,
        })) as boolean;
        const status = valid ? "Valid" : "Invalid";

        setSignatureStatus(status);
    }

    async function saveSecretToDisk() {
        if (jwtStore.secret.length === 0) {
            return;
        }

        try {
            const appDirPath = await appDir();
            await createDir("secrets", { dir: BaseDirectory.App, recursive: true });
            await writeTextFile("secrets/secret", jwtStore.secret, { dir: BaseDirectory.App });
            sendNotification({
                title: "Secret saved",
                body: `Secret written to ${appDirPath}secrets/secret`,
            });
        } catch (error: unknown) {
            console.error(`could not write secret file: ${error}`);
        }
    }

    async function loadSecretFromDisk() {
        const appDirPath = await appDir();

        try {
            const secret = await readTextFile("secrets/secret", { dir: BaseDirectory.App });
            setSecret(secret);
        } catch (error: unknown) {
            sendNotification({
                title: "Cannot load secret",
                body: `Cannot load secret from '${appDirPath}secrets/secret': ${error}`,
            });
        }
    }

    createEffect(() => {
        verifySignature(jwtStore.jwt?.encoded ?? null, jwtStore.secret);
    });

    return (
        <div class="form-control w-full">
            <label class="label mt-2">
                <span class="label-text">HMAC with SHA-256 Secret</span>
            </label>
            <label class="input-group">
                <span>Secret</span>
                <input
                    type="text"
                    value={jwtStore.secret}
                    onInput={(e) => setSecret(e.currentTarget.value)}
                    placeholder="Your shared secret"
                    class="input-bordered input w-full focus:outline-none"
                />
                <button class="btn-primary btn" onClick={saveSecretToDisk}>
                    Save
                </button>
                <button class="btn-warning btn" onClick={loadSecretFromDisk}>
                    Load
                </button>
            </label>
        </div>
    );
}
