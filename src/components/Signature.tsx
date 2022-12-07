import { createSignal, JSX, Show } from "solid-js";
import { jwtStore } from "../stores/jwtStore";
import { SecretInput } from "./SecretInput";
import { SecretInputParanoidMode } from "./SecretInputParanoidMode";
import { SignatureStatus } from "./SignatureStatus";

export type SignatureStatusValues = "Unknown" | "Valid" | "Invalid";

export function Signature(): JSX.Element {
    const [paranoidMode, setParanoidMode] = createSignal<boolean>(false);

    return (
        <div>
            <h2 class="mt-5 text-2xl">
                Signature <SignatureStatus status={jwtStore.signatureStatus} />
            </h2>
            <Show when={!paranoidMode()}>
                <SecretInput />
            </Show>
            <Show when={paranoidMode()}>
                <SecretInputParanoidMode />
            </Show>
            <div class="form-control w-36">
                <label class="label cursor-pointer">
                    <input
                        type="checkbox"
                        checked={paranoidMode()}
                        onInput={(e) => setParanoidMode(e.currentTarget.checked)}
                        class="checkbox"
                    />
                    <span class="label-text">Paranoid Mode</span>
                </label>
            </div>
        </div>
    );
}
