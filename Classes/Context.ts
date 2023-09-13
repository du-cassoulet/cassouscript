import Position from "./Position";
import SymbolTable from "./SymbolTable";

export default class Context {
  public displayName: string;
  public parent: Context | null;
  public parentEntryPos: Position | null;
  public symbolTable: SymbolTable | null;

  constructor(
    displayName: string,
    parent: Context | null = null,
    parentEntryPos: Position | null = null,
    symbolTable: SymbolTable | null = null
  ) {
    this.displayName = displayName;
    this.parent = parent;
    this.parentEntryPos = parentEntryPos;
    this.symbolTable = symbolTable;
  }
}
