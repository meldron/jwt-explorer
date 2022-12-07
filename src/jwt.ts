import { Err, Ok, Result } from "ts-results";

type Header = Record<string, string> & { alg: string; typ: string; kid?: string };

export interface Jwt {
    header: Record<string, string> & { alg: string; typ: string; kid?: string };
    headerEncoded: string;
    payload: Record<string, unknown>;
    payloadEncoded: string;
    signature: string;
    encoded: string;
}

export function parseJwt(encoded: string): Result<Jwt, "invalid"> {
    const parts = encoded.split(".");

    const headerEncoded = parts[0];
    const payloadEncoded = parts[1];
    const signature = parts[2];

    if (headerEncoded === undefined || payloadEncoded === undefined || signature === undefined) {
        return Err("invalid");
    }

    let header: Header;
    let payload: Record<string, unknown>;

    try {
        header = JSON.parse(atob(headerEncoded));
        payload = JSON.parse(atob(payloadEncoded));
    } catch (err) {
        return Err("invalid");
    }

    return Ok({ encoded, header, headerEncoded, payload, payloadEncoded, signature });
}
