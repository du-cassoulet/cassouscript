import Context from "../Context";
import { InvalidSyntaxError } from "../Errors";
import Position from "../Position";

export default class Value {
	public posStart: Position | null = null;
	public posEnd: Position | null = null;
	public context: Context | null = null;

	constructor() {
		this.setPos();
	}

	public setPos(
		posStart: Position | null = null,
		posEnd: Position | null = null
	) {
		this.posStart = posStart;
		this.posEnd = posEnd;
		return this;
	}

	public setContext(context: Context | null = null) {
		this.context = context;
		return this;
	}

	public addedTo(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public subbedBy(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public multedBy(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public divedBy(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public powedBy(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public moduledBy(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public getComparisonEq(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public getComparisonNe(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public getComparisonLt(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public getComparisonGt(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public getComparisonLte(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public getComparisonGte(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public andedBy(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public oredBy(other: Value) {
		return [null, this.illegalOperation(other)];
	}

	public notted() {
		return [null, this.illegalOperation()];
	}

	public execute() {
		return [null, this.illegalOperation()];
	}

	public copy() {
		throw new Error("No copy method defined");
	}

	public isTrue() {
		return true;
	}

	public illegalOperation(other: Value | null = null) {
		if (!other) other = this;

		return new InvalidSyntaxError(
			<Position>this.posStart,
			<Position>this.posEnd,
			"Illegal operation"
		);
	}
}
