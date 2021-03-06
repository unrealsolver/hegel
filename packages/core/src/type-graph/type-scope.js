// @flow
import { Type } from "./types/type";
import { Scope } from "./scope";
import type { Handler } from "../utils/traverse";
import type { ModuleScope } from "./module-scope";
import type { Node, TSInterfaceDeclaration } from "@babel/core";

export class TypeScope {
  priority: number;
  parent: TypeScope | null;
  body: Map<mixed, Type | TSInterfaceDeclaration> = new Map();

  constructor(parent?: TypeScope) {
    this.parent = parent === undefined ? null : parent;
    this.priority = parent === undefined ? 0 : parent.priority + 1;
  }

  makeCustom() {
    this.priority += 100;
  }

  findTypeWithName(
    name: mixed,
    ...rest: [] | [Node, ModuleScope, Handler, Handler, Handler]
  ): Type | void {
    let currentTypeScope = this;
    let existedType = undefined;
    while (currentTypeScope !== null) {
      existedType = currentTypeScope.body.get(name);
      if (existedType !== undefined) {
        if (existedType instanceof Type) {
          return Type.getTypeRoot(existedType);
        }
        if (Scope.canTraverseFunction(rest)) {
          // $FlowIssue
          const result = Scope.addAndTraverseNodeWithType(
            // $FlowIssue
            undefined,
            existedType,
            ...rest
          );
          return Type.getTypeRoot(
            result === undefined ? this.findTypeWithName(name) : result
          );
        }
      }
      currentTypeScope = currentTypeScope.parent;
    }
    return undefined;
  }
}
