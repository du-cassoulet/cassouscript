import TokenTypes from "../Constants/TokenTypes";
import NumberNode from "./Nodes/NumberNode";
import BinOpNode from "./Nodes/BinOpNode";
import ParseResult from "./ParseResult";
import UnaryOpNode from "./Nodes/UnaryOpNode";
import VarAccessNode from "./Nodes/VarAccessNode";
import VarAssignNode from "./Nodes/VarAssignNode";
import IfNode from "./Nodes/IfNode";
import Errors, { ExpectedCharError, InvalidSyntaxError } from "./Errors";
import ForInNode from "./Nodes/ForInNode";
import WhileNode from "./Nodes/WhileNode";
import FuncDefNode from "./Nodes/FuncDefNode";
import CallNode from "./Nodes/CallNode";
import StringNode from "./Nodes/StringNode";
import ListNode from "./Nodes/ListNode";
import ReturnNode from "./Nodes/ReturnNode";
import ContinueNode from "./Nodes/ContinueNode";
import BreakNode from "./Nodes/BreakNode";
import VarReAssignNode from "./Nodes/VarReAssignNode";
import BooleanNode from "./Nodes/BooleanNode";
import VarOperateNode from "./Nodes/VarOperateNode";
import VoidNode from "./Nodes/VoidNode";
import SwitchNode from "./Nodes/SwitchNode";
import ForOfNode from "./Nodes/ForOfNode";
import ParserOptions from "./ParserOptions";
import Token from "./Token";
import BaseNode from "./Nodes/BaseNode";

const keywordParser = new ParserOptions();
const keywords = keywordParser.readKeywords();
class Parser {
  public tokens: Token[];
  public tokIdx: number = 0;
  public currentTok: Token;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.currentTok = this.tokens[this.tokIdx];
  }

  private advance() {
    this.tokIdx++;
    this.updateCurrentTok();
    return this.currentTok;
  }

  private reverse(amount: number = 1) {
    this.tokIdx -= amount;
    this.updateCurrentTok();
    return this.currentTok;
  }

  private updateCurrentTok() {
    if (this.tokIdx >= 0 && this.tokIdx < this.tokens.length) {
      this.currentTok = this.tokens[this.tokIdx];
    }
  }

  public parse() {
    let res = this.statements();
    if (!res.error && this.currentTok.type !== TokenTypes.EOF) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    return res;
  }

  private statements() {
    const res = new ParseResult();
    const statements: BaseNode[] = [];
    const posStart = this.currentTok.posStart.copy();

    while (this.currentTok.type === TokenTypes.NEWLINE) {
      0;
      res.registerAdvancement();
      this.advance();
    }

    const statement = res.register(this.statement());
    if (res.error) return res;
    statements.push(<BaseNode>statement);

    let moreStatements = true;

    while (true) {
      let newlineCount = 0;

      // @ts-ignore
      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
        newlineCount++;
      }

      if (newlineCount === 0) {
        moreStatements = false;
      }

      if (!moreStatements) break;
      let statement = res.tryRegister(this.statement());
      if (!statement) {
        this.reverse(res.toReverseCount);
        moreStatements = true;
        continue;
      }

      statements.push(statement);
    }

    return res.success(
      new ListNode(statements, posStart, this.currentTok.posEnd.copy())
    );
  }

  private statement() {
    const res = new ParseResult();
    const posStart = this.currentTok.posStart.copy();

    if (this.currentTok.matches(TokenTypes.KEYWORD, "return")) {
      res.registerAdvancement();
      this.advance();

      const expr = res.tryRegister(this.expr());
      if (!expr) this.reverse(res.toReverseCount);

      return res.success(
        new ReturnNode(expr, posStart, this.currentTok.posStart.copy())
      );
    }

    if (this.currentTok.matches(TokenTypes.KEYWORD, "continue")) {
      res.registerAdvancement();
      this.advance();

      return res.success(
        new ContinueNode(posStart, this.currentTok.posStart.copy())
      );
    }

    if (this.currentTok.matches(TokenTypes.KEYWORD, "break")) {
      res.registerAdvancement();
      this.advance();

      return res.success(
        new BreakNode(posStart, this.currentTok.posStart.copy())
      );
    }

    const expr = res.register(this.expr());
    if (res.error) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    return res.success(<BaseNode>expr);
  }

  private expr() {
    const res = new ParseResult();

    if (this.currentTok.matches(TokenTypes.KEYWORD, "set")) {
      res.registerAdvancement();
      this.advance();

      if (this.currentTok.type !== TokenTypes.IDENTIFIER) {
        return res.failure(
          new InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "<ERROR>"
          )
        );
      }

      const varName = this.currentTok;
      res.registerAdvancement();
      this.advance();

      // @ts-ignore
      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      // @ts-ignore
      if (this.currentTok.type !== TokenTypes.EQ) {
        return res.failure(
          new InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "<ERROR>"
          )
        );
      }

      res.registerAdvancement();
      this.advance();

      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      const expr = res.register(this.expr());
      if (res.error) return res;
      return res.success(new VarAssignNode(varName, expr));
    }

    const node = res.register(
      this.binOp(
        "compExpr",
        [TokenTypes.AND, TokenTypes.OR, [TokenTypes.KEYWORD, "in"]],
        "compExpr"
      )
    );

    if (res.error) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    return res.success(<BaseNode>node);
  }

  private binOp(
    funca: string,
    ops: (string | [string, string])[],
    funcb: string
  ) {
    const res = new ParseResult();
    let left = res.register(this[funca]());
    if (res.error) return res;

    while (
      ops.includes(this.currentTok.type) ||
      ops.find((e) => this.currentTok.matches(<TokenTypes>e[0], e[1]))
    ) {
      const opTok = this.currentTok;
      this.advance();
      const right = res.register(this[funcb]());
      if (res.error) return res;

      left = new BinOpNode(left, opTok, right);
    }

    return res.success(<BaseNode>left);
  }

  public compExpr() {
    const res = new ParseResult();

    if (this.currentTok.type === TokenTypes.NOT) {
      const opTok = this.currentTok;
      res.registerAdvancement();
      this.advance();

      const node = res.register(this.compExpr());
      if (res.error) return res;
      return res.success(new UnaryOpNode(opTok, node));
    }

    const node = res.register(
      this.binOp(
        "arithExpr",
        [
          TokenTypes.EE,
          TokenTypes.NE,
          TokenTypes.LT,
          TokenTypes.GT,
          TokenTypes.LTE,
          TokenTypes.GTE,
        ],
        "arithExpr"
      )
    );

    if (res.error) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    return res.success(<BaseNode>node);
  }

  public arithExpr() {
    return this.binOp("term", [TokenTypes.PLUS, TokenTypes.MINUS], "term");
  }

  public term() {
    return this.binOp(
      "factor",
      [TokenTypes.MUL, TokenTypes.DIV, TokenTypes.MODULO],
      "factor"
    );
  }

  public factor() {
    const res = new ParseResult();
    const tok = this.currentTok;

    if ([TokenTypes.PLUS, TokenTypes.MINUS].includes(tok.type)) {
      res.registerAdvancement();
      this.advance();

      const factor = res.register(this.factor());
      if (res.error) return res;

      return res.success(new UnaryOpNode(tok, factor));
    }

    return this.power();
  }

  private power() {
    return this.binOp("call", [TokenTypes.POW], "factor");
  }

  public call() {
    const res = new ParseResult();
    const atom = res.register(this.atom());
    if (res.error) return res;

    if (this.currentTok.type === TokenTypes.LPAREN) {
      res.registerAdvancement();
      this.advance();
      const argNodes: BaseNode[] = [];

      // @ts-ignore
      if (this.currentTok.type === TokenTypes.RPAREN) {
        res.registerAdvancement();
        this.advance();
      } else {
        argNodes.push(<BaseNode>res.register(this.expr()));
        if (res.error) {
          return res.failure(
            new InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "<ERROR>"
            )
          );
        }

        // @ts-ignore
        while (this.currentTok.type === TokenTypes.COMMA) {
          res.registerAdvancement();
          this.advance();

          argNodes.push(<BaseNode>res.register(this.expr()));
          if (res.error) return res;
        }

        // @ts-ignore
        if (this.currentTok.type !== TokenTypes.RPAREN) {
          return res.failure(
            new InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "<ERROR>"
            )
          );
        }

        res.registerAdvancement();
        this.advance();
      }

      return res.success(new CallNode(atom, argNodes, false));
    }

    return res.success(<BaseNode>atom);
  }

  private atom() {
    const res = new ParseResult();
    const tok = this.currentTok;

    if ([TokenTypes.INT, TokenTypes.FLOAT].includes(tok.type)) {
      res.registerAdvancement();
      this.advance();
      return res.success(new NumberNode(tok));
    } else if (tok.type === TokenTypes.STRING) {
      res.registerAdvancement();
      this.advance();
      return res.success(new StringNode(tok));
    } else if (
      tok.matches(TokenTypes.KEYWORD, "true") ||
      tok.matches(TokenTypes.KEYWORD, "false")
    ) {
      res.registerAdvancement();
      this.advance();
      return res.success(new BooleanNode(tok));
    } else if (
      tok.matches(TokenTypes.KEYWORD, "null") ||
      tok.matches(TokenTypes.KEYWORD, "NaN")
    ) {
      res.registerAdvancement();
      this.advance();
      return res.success(new VoidNode(tok));
    } else if (tok.type === TokenTypes.IDENTIFIER) {
      res.registerAdvancement();
      this.advance();

      if (this.currentTok.type === TokenTypes.EQ) {
        res.registerAdvancement();
        this.advance();

        // @ts-ignore
        while (this.currentTok.type === TokenTypes.NEWLINE) {
          res.registerAdvancement();
          this.advance();
        }

        const expr = res.register(this.expr());
        if (res.error) return res;

        return res.success(new VarReAssignNode(tok, <BaseNode>expr));
      } else if (
        [
          TokenTypes.PLE,
          TokenTypes.MIE,
          TokenTypes.MUE,
          TokenTypes.DIE,
        ].includes(this.currentTok.type)
      ) {
        const operatorTok = this.currentTok;
        res.registerAdvancement();
        this.advance();

        const expr = res.register(this.expr());
        if (res.error) return res;
        return res.success(
          new VarOperateNode(tok, operatorTok, <BaseNode>expr)
        );
      }

      return res.success(new VarAccessNode(tok));
    } else if (tok.type === TokenTypes.LPAREN) {
      res.registerAdvancement();
      this.advance();
      const expr = res.register(this.expr());
      if (res.error) return res;

      if (this.currentTok.type === TokenTypes.RPAREN) {
        res.registerAdvancement();
        this.advance();
        return res.success(<BaseNode>expr);
      } else {
        return res.failure(
          new ExpectedCharError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "<ERROR>"
          )
        );
      }
    } else if (tok.matches(TokenTypes.KEYWORD, "if")) {
      const ifExpr = res.register(this.ifExpr());
      if (res.error) return res;
      return res.success(<BaseNode>ifExpr);
    } else if (tok.matches(TokenTypes.KEYWORD, "for")) {
      const forExpr = res.register(this.forExpr());
      if (res.error) return res;
      return res.success(<BaseNode>forExpr);
    } else if (tok.matches(TokenTypes.KEYWORD, "while")) {
      const whileExpr = res.register(this.whileExpr());
      if (res.error) return res;
      return res.success(<BaseNode>whileExpr);
    } else if (tok.matches(TokenTypes.KEYWORD, "switch")) {
      const switchExpr = res.register(this.switchExpr());
      if (res.error) return res;
      return res.success(<BaseNode>switchExpr);
    } else if (tok.matches(TokenTypes.KEYWORD, "func")) {
      const funcDef = res.register(this.funcDef());
      if (res.error) return res;
      return res.success(<BaseNode>funcDef);
    }

    return res.failure(
      new InvalidSyntaxError(
        this.currentTok.posStart,
        this.currentTok.posEnd,
        "<ERROR>"
      )
    );
  }

  funcDef() {
    let res = new ParseResult();
    let typeTok = null;

    if (!this.currentTok.matches(TokenTypes.KEYWORD, keywords.func)) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    if (this.currentTok.type === TokenTypes.IDENTIFIER) {
      var varNameTok = this.currentTok;
      res.registerAdvancement();
      this.advance();

      if (this.currentTok.type === TokenTypes.LT) {
        res.registerAdvancement();
        this.advance();

        if (this.currentTok.type !== TokenTypes.TYPE) {
          return res.failure(
            new Errors.InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "Expected type"
            )
          );
        }

        typeTok = this.currentTok;
        res.registerAdvancement();
        this.advance();

        if (this.currentTok.type !== TokenTypes.GT) {
          return res.failure(
            new Errors.InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "Expected '>'"
            )
          );
        }

        res.registerAdvancement();
        this.advance();
      }

      if (this.currentTok.type !== TokenTypes.LPAREN) {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected '('"
          )
        );
      }
    } else {
      var varNameTok = null;

      if (this.currentTok.type !== TokenTypes.LPAREN) {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected '('"
          )
        );
      }
    }

    res.registerAdvancement();
    this.advance();
    let argNameToks = [];

    if (this.currentTok.type === TokenTypes.IDENTIFIER) {
      argNameToks.push(this.currentTok);
      res.registerAdvancement();
      this.advance();

      while (this.currentTok.type === TokenTypes.COMMA) {
        res.registerAdvancement();
        this.advance();

        if (this.currentTok.type !== TokenTypes.IDENTIFIER) {
          return res.failure(
            new Errors.InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "Expected identifier"
            )
          );
        }

        argNameToks.push(this.currentTok);
        res.registerAdvancement();
        this.advance();
      }

      if (this.currentTok.type !== TokenTypes.RPAREN) {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected ',' or ')'"
          )
        );
      }
    } else {
      if (this.currentTok.type !== TokenTypes.RPAREN) {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected ',' or ')'"
          )
        );
      }
    }

    res.registerAdvancement();
    this.advance();

    if (this.currentTok.type === TokenTypes.ARROW) {
      res.registerAdvancement();
      this.advance();
      let nodeToReturn = res.register(this.expr());
      if (res.error) return res;

      return res.success(
        new FuncDefNode(varNameTok, argNameToks, nodeToReturn, typeTok, true)
      );
    } else if (this.currentTok.type === TokenTypes.LBRACKET) {
      res.registerAdvancement();
      this.advance();

      let body = res.register(this.statements());
      if (res.error) return res;

      if (this.currentTok.type !== TokenTypes.RBRACKET) {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected '}'"
          )
        );
      }

      res.registerAdvancement();
      this.advance();

      return res.success(
        new FuncDefNode(varNameTok, argNameToks, body, typeTok, false)
      );
    } else {
      return res.failure(
        new Errors.InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "Expected '{' or '->'"
        )
      );
    }
  }

  switchExpr() {
    let res = new ParseResult();

    if (!this.currentTok.matches(TokenTypes.KEYWORD, keywords.switch)) {
      return res.failure(
        new Errors.InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "Expected 'switch'"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    let switchNode = res.register(this.expr());
    if (res.error) return res;

    if (this.currentTok.type !== TokenTypes.LBRACKET) {
      return res.failure(
        new Errors.InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "Expected '{'"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    while (this.currentTok.type === TokenTypes.NEWLINE) {
      res.registerAdvancement();
      this.advance();
    }

    let caseNodes = [];
    let defaultNode = null;

    while (
      this.currentTok.type !== TokenTypes.RBRACKET &&
      this.currentTok.type !== TokenTypes.EOF
    ) {
      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      if (this.currentTok.matches(TokenTypes.KEYWORD, keywords.case)) {
        let caseExpr = res.register(this.caseExpr());
        if (res.error) return res;
        caseNodes.push(caseExpr);
      } else if (
        this.currentTok.matches(TokenTypes.KEYWORD, keywords.default)
      ) {
        res.registerAdvancement();
        this.advance();

        while (this.currentTok.type === TokenTypes.NEWLINE) {
          res.registerAdvancement();
          this.advance();
        }

        if (this.currentTok.type === TokenTypes.ARROW) {
          res.registerAdvancement();
          this.advance();

          while (this.currentTok.type === TokenTypes.NEWLINE) {
            res.registerAdvancement();
            this.advance();
          }

          defaultNode = [res.register(this.statement()), false];
          if (res.error) return res;
        } else if (this.currentTok.type === TokenTypes.LBRACKET) {
          res.registerAdvancement();
          this.advance();

          defaultNode = [res.register(this.statements()), true];
          if (res.error) return res;

          if (this.currentTok.type !== TokenTypes.RBRACKET) {
            return res.failure(
              new Errors.InvalidSyntaxError(
                this.currentTok.posStart,
                this.currentTok.posEnd,
                "Expected '}'"
              )
            );
          }

          res.registerAdvancement();
          this.advance();
        } else {
          return res.failure(
            new Errors.InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "Expected '{' or '->'"
            )
          );
        }
      } else {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected 'case', 'default' or '}'"
          )
        );
      }

      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }
    }

    if (this.currentTok.type !== TokenTypes.RBRACKET) {
      return res.failure(
        new Errors.InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "Expected 'case', 'default' or '}'"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    return res.success(new SwitchNode(switchNode, caseNodes, defaultNode));
  }

  caseExpr() {
    let res = new ParseResult();
    let shouldReturnNull = true;

    if (!this.currentTok.matches(TokenTypes.KEYWORD, keywords.case)) {
      return res.failure(
        new Errors.InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "Expected 'case'"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    let condition = res.register(this.expr());
    if (res.error) return res;

    while (this.currentTok.type === TokenTypes.NEWLINE) {
      res.registerAdvancement();
      this.advance();
    }

    if (this.currentTok.type === TokenTypes.ARROW) {
      res.registerAdvancement();
      this.advance();

      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      shouldReturnNull = false;
      var body = res.register(this.statement());
      if (res.error) return res;
    } else if (this.currentTok.type === TokenTypes.LBRACKET) {
      res.registerAdvancement();
      this.advance();

      var body = res.register(this.statements());
      if (res.error) return res;

      if (this.currentTok.type !== TokenTypes.RBRACKET) {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected '}'"
          )
        );
      }

      res.registerAdvancement();
      this.advance();
    } else {
      return res.failure(
        new Errors.InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "Expected '{' or '->'"
        )
      );
    }

    return res.success([condition, body, shouldReturnNull]);
  }

  private forExpr() {
    const res = new ParseResult();

    if (!this.currentTok.matches(TokenTypes.KEYWORD, "for")) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    if (this.currentTok.type !== TokenTypes.IDENTIFIER) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    const varName = this.currentTok;
    res.registerAdvancement();
    this.advance();

    // @ts-ignore
    if (this.currentTok.type !== TokenTypes.EQ) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    if (this.currentTok.matches(TokenTypes.KEYWORD, "each")) {
      res.registerAdvancement();
      this.advance();

      const browseValue = res.register(this.expr());
      if (res.error) return res;

      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      if (this.currentTok.type === TokenTypes.ARROW) {
        res.registerAdvancement();
        this.advance();

        while (this.currentTok.type === TokenTypes.NEWLINE) {
          res.registerAdvancement();
          this.advance();
        }

        const body = res.register(this.statement());
        if (res.error) return res;

        return res.success(new ForOfNode(varName, browseValue, body, false));
      } else if (this.currentTok.type === TokenTypes.LBRACKET) {
        res.registerAdvancement();
        this.advance();

        const body = res.register(this.statements());
        if (res.error) return res;

        if (this.currentTok.type !== TokenTypes.RBRACKET) {
          return res.failure(
            new InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "<ERROR>"
            )
          );
        }

        res.registerAdvancement();
        this.advance();

        return res.success(new ForOfNode(varName, browseValue, body, true));
      }
    } else if (this.currentTok.matches(TokenTypes.KEYWORD, "to")) {
      const startValue = res.register(this.expr());
      if (res.error) return res;

      res.registerAdvancement();
      this.advance();

      const endValue = res.register(this.expr());
      if (res.error) return res;

      let stepValue: BaseNode | null = null;
      if (this.currentTok.matches(TokenTypes.KEYWORD, "inc")) {
        res.registerAdvancement();
        this.advance();

        stepValue = res.register(this.expr());
        if (res.error) return res;
      }

      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      if (this.currentTok.type === TokenTypes.ARROW) {
        res.registerAdvancement();
        this.advance();

        while (this.currentTok.type === TokenTypes.NEWLINE) {
          res.registerAdvancement();
          this.advance();
        }

        const body = res.register(this.statement());
        if (res.error) return res;

        return res.success(
          new ForInNode(varName, startValue, endValue, stepValue, body, false)
        );
      } else if (this.currentTok.type === TokenTypes.LBRACKET) {
        res.registerAdvancement();
        this.advance();

        const body = res.register(this.statements());
        if (res.error) return res;

        if (this.currentTok.type !== TokenTypes.RBRACKET) {
          return res.failure(
            new InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "<ERROR>"
            )
          );
        }

        res.registerAdvancement();
        this.advance();

        return res.success(
          new ForInNode(varName, startValue, endValue, stepValue, body, true)
        );
      }
    } else {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }
  }

  private whileExpr() {
    const res = new ParseResult();

    if (!this.currentTok.matches(TokenTypes.KEYWORD, "while")) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    let condition = res.register(this.expr());
    if (res.error) return res;

    while (this.currentTok.type === TokenTypes.NEWLINE) {
      res.registerAdvancement();
      this.advance();
    }

    if (this.currentTok.type === TokenTypes.ARROW) {
      res.registerAdvancement();
      this.advance();

      // @ts-ignore
      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      let body = res.register(this.statement());
      if (res.error) return res;

      res.registerAdvancement();
      this.advance();

      return res.success(new WhileNode(condition, body, false));
    } else if (this.currentTok.type === TokenTypes.LBRACKET) {
      res.registerAdvancement();
      this.advance();

      let body = res.register(this.statements());
      if (res.error) return res;

      // @ts-ignore
      if (this.currentTok.type === TokenTypes.RBRACKET) {
        res.registerAdvancement();
        this.advance();
      } else {
        return res.failure(
          new InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected '}'"
          )
        );
      }

      res.registerAdvancement();
      this.advance();

      return res.success(new WhileNode(condition, body, true));
    } else {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }
  }

  private ifExpr() {
    const res = new ParseResult();
    const allCases = res.register(this.ifExprCases("if"));
    if (res.error) return res;

    const { cases, elseCase } = allCases;
    return res.success(new IfNode(cases, elseCase));
  }

  private ifExprB() {
    const res = new ParseResult();
    let elseCase: [BaseNode, boolean] | null = null;

    if (this.currentTok.matches(TokenTypes.KEYWORD, "else")) {
      res.registerAdvancement();
      this.advance();

      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      if (this.currentTok.type === TokenTypes.LBRACKET) {
        res.registerAdvancement();
        this.advance();

        const statements = res.register(this.statements());
        if (res.error) return res;
        elseCase = [<BaseNode>statements, true];

        // @ts-ignore
        if (this.currentTok.type === TokenTypes.RBRACKET) {
          res.registerAdvancement();
          this.advance();
        } else {
          return res.failure(
            new InvalidSyntaxError(
              this.currentTok.posStart,
              this.currentTok.posEnd,
              "<ERROR>"
            )
          );
        }
      } else {
        const expr = res.register(this.statement());
        if (res.error) return res;
        elseCase = [<BaseNode>expr, false];
      }
    }

    return res.success(elseCase);
  }

  /**
   * The conversion of tokens in a If Node.
   * @param {string} caseKeyword
   * @returns {ParseResult}
   */
  ifExprCases(caseKeyword) {
    let res = new ParseResult();
    let cases = [];
    let elseCase = null;

    if (!this.currentTok.matches(TokenTypes.KEYWORD, caseKeyword)) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    const condition = res.register(this.expr());
    if (res.error) return res;

    while (this.currentTok.type === TokenTypes.NEWLINE) {
      res.registerAdvancement();
      this.advance();
    }

    if (this.currentTok.type === TokenTypes.ARROW) {
      res.registerAdvancement();
      this.advance();

      // @ts-ignore
      while (this.currentTok.type === TokenTypes.NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      let expr = res.register(this.statement());
      if (res.error) return res;
      cases.push([condition, expr, false]);

      let allCases = res.register(this.ifExprB());
      if (res.error) return res;
      let newCases = [];
      [newCases, elseCase] = allCases;
      cases = [...cases, ...newCases];
    } else if (this.currentTok.type === TokenTypes.LBRACKET) {
      res.registerAdvancement();
      this.advance();

      let statements = res.register(this.statements());
      if (res.error) return res;
      cases.push([condition, statements, true]);

      if (this.currentTok.type === TokenTypes.RBRACKET) {
        res.registerAdvancement();
        this.advance();
      } else {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected '}'"
          )
        );
      }

      let allCases = res.register(this.ifExprB());
      if (res.error) return res;
      let newCases = [];
      [newCases, elseCase] = allCases;
      cases = [...cases, ...newCases];
    } else {
      return res.failure(
        new Errors.InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "Expected '{' or '->'"
        )
      );
    }

    return res.success([cases, elseCase]);
  }

  private listExpr() {
    const res = new ParseResult();
    const elementNodes: BaseNode[] = [];
    const posStart = this.currentTok.posStart.copy();

    if (this.currentTok.type !== TokenTypes.LSQUARE) {
      return res.failure(
        new InvalidSyntaxError(
          this.currentTok.posStart,
          this.currentTok.posEnd,
          "<ERROR>"
        )
      );
    }

    res.registerAdvancement();
    this.advance();

    // @ts-ignore
    while (this.currentTok.type === TokenTypes.NEWLINE) {
      res.registerAdvancement();
      this.advance();
    }

    // @ts-ignore
    if (this.currentTok.type === TokenTypes.RSQUARE) {
      res.registerAdvancement();
      this.advance();
    } else {
      elementNodes.push(res.register(this.expr()));
      if (res.error) {
        return res.failure(
          new InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "<ERROR>"
          )
        );
      }

      while (this.currentTok.type === Flags.TT_COMMA) {
        res.registerAdvancement();
        this.advance();

        while (this.currentTok.type === Flags.TT_NEWLINE) {
          res.registerAdvancement();
          this.advance();
        }

        elementNodes.push(res.register(this.expr()));
        if (res.error) return res;
      }

      while (this.currentTok.type === Flags.TT_NEWLINE) {
        res.registerAdvancement();
        this.advance();
      }

      if (this.currentTok.type !== Flags.TT_RSQUARE) {
        return res.failure(
          new Errors.InvalidSyntaxError(
            this.currentTok.posStart,
            this.currentTok.posEnd,
            "Expected ']' or ','"
          )
        );
      }

      res.registerAdvancement();
      this.advance();
    }

    return res.success(
      new ListNode(elementNodes, posStart, this.currentTok.posEnd.copy())
    );
  }
}

export default Parser;
