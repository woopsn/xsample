import { parse } from "../xsampler/parser";
import { visit } from "../fpu/vm";

export function Script(source) {
		this.source = source;
		this.inputs = [{ name: "t", source: "t" }];
}

Script.prototype.compile = function() {
		let ast = parse(this.source.value.trim());
		ast = this.preprocess(ast);
		return ast;
}

Script.prototype.preprocess = function(ast) {
    visit(ast, function(node) {
				let lhs, rhs;

				let assignop = node?.lhs?.op == "$resolve" ? "$register" : "$set";

				switch(node.op) {
				case "=":
            node.op = assignop;
						break;

				case "+=":
				case "-=":
				case "*=":
				case "/=":
				case "^=":
				case "|=":
				case "&=":
				case ".*=":
				case "./=":
				case ".^=":
						rhs = { op: node.op.substr(0, node.op.length-1),
										lhs: node.lhs, rhs: node.rhs };

            node.op = assignop;
            node.rhs = rhs;
						break;

        case ":":
            node.op = "$call";
            node.sym = "colon";
            node.args = [node.lhs, node.rhs];
            delete node.lhs;
            delete node.rhs;
            break;

				}
		});

    visit(ast, function(node) {
        if (node.op == "^" && node.rhs.op == "$resolve" && node.rhs.sym == "T") {
            node.op = "$call";
            node.sym = "transpose";
            node.args = [node.lhs];
            delete node.lhs;
            delete node.rhs;
        }
    });

		return ast;
}
