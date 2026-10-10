// The parameters and body of `@(x) ...`, as AST nodes.
export interface Formula {
    params: unknown[];
    code: unknown[];
}

// Every value is a matrix in row-major order; a scalar is 1x1.
export interface Value {
    rows: number;
    cols: number;
    data: Float64Array;
    formula?: Formula;
}

export function mknum(rows: number, cols: number, val?: number): Value {
    const num: Value = { rows, cols, data: new Float64Array(rows*cols) };
    if (val) num.data.fill(val);
    return num;
}
