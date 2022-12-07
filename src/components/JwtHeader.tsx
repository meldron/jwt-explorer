import { For, Show } from "solid-js";
import { jwtStore } from "../stores/jwtStore";

export function JwtHeader() {
    return (
        <div>
            <h2 class="my-4 text-2xl">Header</h2>

            <Show when={jwtStore.jwt} keyed>
                {(jwt) => (
                    <div class="overflow-x-auto">
                        <table class="table-compact table w-full">
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <For each={Object.entries(jwt.header)}>
                                    {([key, value]) => (
                                        <tr>
                                            <td>{key}</td>
                                            <td>{value}</td>
                                        </tr>
                                    )}
                                </For>
                            </tbody>
                        </table>
                    </div>
                )}
            </Show>
        </div>
    );
}
