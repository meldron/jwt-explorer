import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import { createEffect, JSXElement } from "solid-js";
import { jwtStore } from "../stores/jwtStore";

export function Payload(): JSXElement {
    const container = <div id="jsoneditor" />;

    const options: JSONEditorOptions = {
        mode: "form",
        theme: "tailwind",
        search: false,
        statusBar: false,
        navigationBar: false,
        mainMenuBar: false,
    };
    const editor = new JSONEditor(container as HTMLElement, options);

    createEffect(() => {
        editor.set(jwtStore.jwt?.payload);
        editor.expandAll();
    });

    return (
        <div class="max-h-max break-words">
            <h2 class="text-2xl">Payload</h2>
            <div>{container}</div>
        </div>
    );
}
