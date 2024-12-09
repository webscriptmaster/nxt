import { AsterickSignDirective } from "./app-asterick-sign.directive";
import { ClickOutsideDirective } from "./click-outside.directive";
import { LongPressDirective } from "./long-press.directive";
import { WordSplitterDirective } from "./word-splitter.directive";

export const directives = [LongPressDirective, ClickOutsideDirective, WordSplitterDirective, AsterickSignDirective]

export * from "./long-press.directive";
export * from "./click-outside.directive";
export * from "./word-splitter.directive";
export * from "./app-asterick-sign.directive"