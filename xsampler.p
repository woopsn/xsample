{{
		function makeOp(head, tail) {
				return tail.reduce(function(result, element) {
           return { op: element[1], lhs: result, rhs: element[3] };
				}, head);
		}
}}

{
		// Whether the sign before `offset` starts an element of a matrix: it
		// is preceded by whitespace and followed by none, and the innermost
		// bracket open around it is a "[".
		function startsElement(offset) {
				if (!/[ \t]/.test(input[offset - 2]) || /\s/.test(input[offset]))
						return false;

				// brackets in strings and comments do not count
				const code = input
						.slice(0, offset - 1)
						.replace(/"[^"\r\n]*"|[%#][^\r\n]*/g, "");

				let depth = 0;
				for (let i = code.length - 1; i >= 0; --i) {
						if (code[i] == ")" || code[i] == "]") depth++;
						else if (code[i] == "(" || code[i] == "[") {
								if (depth == 0) return code[i] == "[";
								depth--;
						}
				}

				return false;
		}
}

Program = __ statements:Statement* { return statements; }

Statement = expr:Expression semi { return expr; }

Expression = _ expr:(SetExpr / LogExpr) _ { return expr; }
SetExpr = lhs:VariableOrCall tail:(_ setop _ Expression)+ { return makeOp(lhs, tail); }
LogExpr = head:RngExpr tail:(_ logop _ RngExpr)* { return makeOp(head, tail) }
RngExpr = head:CmpExpr tail:(_ rngop _ CmpExpr)* { return makeOp(head, tail) }
CmpExpr = head:AddExpr tail:(_ cmpop _ AddExpr)* { return makeOp(head, tail) }
AddExpr = head:MulExpr tail:(_ addop _ MulExpr)* { return makeOp(head, tail) }
MulExpr = head:UnaryExpr tail:(_ mulop _ UnaryExpr)* { return makeOp(head, tail) }
UnaryExpr = unop:[-+!] expr:UnaryExpr { return { op: unop, lhs: { op: "$mkscalar", value: 0 }, rhs: expr }; }
          / ExpExpr
ExpExpr = head:Term tail:(_ expop _ ExpOperand)* { return makeOp(head, tail) }
ExpOperand = unop:[-+!] expr:ExpOperand { return { op: unop, lhs: { op: "$mkscalar", value: 0 }, rhs: expr }; }
           / Term

Term
  = "(" _ expr:Expression _ ")" args:Args? {
			if (args)
					return { op: expr, args: args };
			else
					return expr;
	}
	/ Formula
	/ VariableOrCall
  / Numeric
  / String

Formula
  = "@" args:Args expr:Expression {
      return { op: "$mkformula", params: args, formula: expr };
  }

VariableOrCall
 = expr:Variable args:Args? {
			if (args)
          return { op: "$call", sym: expr, args: args };
			else
          return { op: "$resolve", sym: expr };
	}

Args
	= "(" _ ")" { return []; }
	/ "(" _ head:Expression tail:(_ "," _ Expression )* _ ")" {
			return [head, ...tail.map(function(e) { return e[3]; })];
	}

Variable
	= [A-Za-z][A-Za-z0-9_]* { return text() }

Numeric
  = Decimal "e" [-+]? Integer { return { op: "$mkscalar", value: parseFloat(text()) }; }
  / Integer "e" [-+]? Integer { return { op: "$mkscalar", value: parseFloat(text()) }; }
  / Decimal / Integer / Matrix

Matrix
	= "[" _ "]" { return {op: "$mkmatrix", rows: 0, args: [] }; }
	/ "[" _ head:MatrixRow tail:(_ semi MatrixRow)* _ "]" {
      let rows = 1 + tail.length;
      let args = [...head, ...tail.flatMap(function(e) { return e[2]; })];
      return { op: "$mkmatrix", rows, args };
  }
MatrixRow
	= head:Expression tail:(_  ","? _ Expression)* {
			return [head, ...tail.map(function(e) { return e[3]; })];
	}

// A string is a row of character codes; it cannot span lines.
String "string"
  = '"' value:$[^"\r\n]* '"' { return { op: "$mkstring", value }; }

Integer "integer"
	= [0-9]+ { return { op: "$mkscalar", value: parseInt(text()) } }

Decimal "float"
  = [0-9]+[.][0-9]+ { return { op: "$mkscalar", value: parseFloat(text()) }; }

setop = "."? ("=" / "+=" / "-=" / "*=" / "/=" / "|=" / "&=" / "^=") { return text(); }
logop = "."? ("||" / "|" / "&&" / "&") { return text(); }
rngop = ":" { return text(); }
cmpop = ("<=" / "<" / ">=" / ">" / "==" / "!=") { return text(); }
// Inside a matrix, a sign after whitespace and before none starts a new
// element: [1 -1] has two elements, and [1 - 1] and [1-1] have one.
addop = op:("+" / "-") !{ return startsElement(offset()); } { return op; }
mulop = "."? ("*" / "/") { return text(); }
expop = "."? ("^") { return text(); }

// A comment runs from % or # to the end of the line.
comment = [%#] [^\r\n]*

_ "whitespace"
  = ([ \t\r] / "..." [\r\n]+ / comment)*

// Whitespace, comments and blank lines.
__ = ([ \t\r\n] / comment)*

semi
  = (";" / [\r\n]) __ / !.
