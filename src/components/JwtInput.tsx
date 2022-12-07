import { createEffect } from "solid-js";
import { parseJwt } from "../jwt";
import { jwtStore, setJwt, setRawJwt } from "../stores/jwtStore";

export function JwtInput() {
    createEffect(() => {
        const result = parseJwt(jwtStore.raw);

        if (result.ok) {
            setJwt(result.val);
        } else {
            setJwt(null);
        }
    });

    return (
        <div>
            <textarea
                id="jwt-input"
                rows={8}
                value={jwtStore.raw}
                onInput={(e) => setRawJwt(e.currentTarget.value)}
                class="block h-48 w-11/12 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
        </div>
    );
}
