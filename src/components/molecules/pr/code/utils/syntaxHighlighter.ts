/**
 * Syntax Highlighting Utilities for Code Diff Animations
 * Provides language detection and syntax highlighting for video rendering
 */

import { colors } from '../../../../../theme/colors';

export interface SyntaxToken {
  type: TokenType;
  content: string;
  start: number;
  end: number;
  color: string;
  style?: React.CSSProperties;
}

export type TokenType = 
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'operator'
  | 'identifier'
  | 'type'
  | 'function'
  | 'property'
  | 'tag'
  | 'attribute'
  | 'text'
  | 'punctuation'
  | 'whitespace';

export interface LanguageConfig {
  name: string;
  keywords: string[];
  operators: string[];
  stringDelimiters: string[];
  commentPatterns: RegExp[];
  numberPattern: RegExp;
  identifierPattern: RegExp;
  colorScheme: TokenColorScheme;
}

export interface TokenColorScheme {
  keyword: string;
  string: string;
  comment: string;
  number: string;
  operator: string;
  identifier: string;
  type: string;
  function: string;
  property: string;
  tag: string;
  attribute: string;
  text: string;
  punctuation: string;
}

/**
 * Default color scheme based on the theme
 */
const defaultColorScheme: TokenColorScheme = {
  keyword: colors.primary[600],
  string: colors.success,
  comment: colors.neutral[500],
  number: colors.secondary[600], 
  operator: colors.neutral[700],
  identifier: colors.text.primary,
  type: colors.primary[500],
  function: colors.secondary[700],
  property: colors.primary[400],
  tag: colors.primary[600],
  attribute: colors.secondary[500],
  text: colors.text.primary,
  punctuation: colors.neutral[600],
};

/**
 * Language configurations for syntax highlighting
 */
const languageConfigs: Record<string, LanguageConfig> = {
  typescript: {
    name: 'TypeScript',
    keywords: [
      'abstract', 'any', 'as', 'boolean', 'break', 'case', 'catch', 'class',
      'const', 'constructor', 'continue', 'debugger', 'declare', 'default',
      'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally',
      'for', 'from', 'function', 'get', 'if', 'implements', 'import', 'in',
      'instanceof', 'interface', 'let', 'module', 'namespace', 'never', 'new',
      'null', 'number', 'object', 'package', 'private', 'protected', 'public',
      'readonly', 'return', 'set', 'static', 'string', 'super', 'switch',
      'symbol', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined',
      'unique', 'unknown', 'var', 'void', 'while', 'with', 'yield'
    ],
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '?', ':', '=>'],
    stringDelimiters: ['"', "'", '`'],
    commentPatterns: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
    numberPattern: /\b\d+(\.\d+)?\b/g,
    identifierPattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g,
    colorScheme: defaultColorScheme,
  },
  javascript: {
    name: 'JavaScript',
    keywords: [
      'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
      'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends',
      'false', 'finally', 'for', 'from', 'function', 'if', 'import', 'in',
      'instanceof', 'let', 'new', 'null', 'return', 'super', 'switch', 'this',
      'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while',
      'with', 'yield'
    ],
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '?', ':', '=>'],
    stringDelimiters: ['"', "'", '`'],
    commentPatterns: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
    numberPattern: /\b\d+(\.\d+)?\b/g,
    identifierPattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g,
    colorScheme: defaultColorScheme,
  },
  python: {
    name: 'Python',
    keywords: [
      'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del',
      'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global',
      'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or',
      'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'
    ],
    operators: ['+', '-', '*', '/', '//', '%', '**', '=', '==', '!=', '<', '>', '<=', '>=', 'and', 'or', 'not', 'in', 'is'],
    stringDelimiters: ['"', "'", '"""', "'''"],
    commentPatterns: [/#.*$/gm],
    numberPattern: /\b\d+(\.\d+)?\b/g,
    identifierPattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g,
    colorScheme: defaultColorScheme,
  },
  java: {
    name: 'Java',
    keywords: [
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch',
      'char', 'class', 'const', 'continue', 'default', 'do', 'double',
      'else', 'enum', 'extends', 'false', 'final', 'finally', 'float',
      'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
      'interface', 'long', 'native', 'new', 'null', 'package', 'private',
      'protected', 'public', 'return', 'short', 'static', 'strictfp',
      'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
      'transient', 'true', 'try', 'void', 'volatile', 'while'
    ],
    operators: ['+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '?', ':'],
    stringDelimiters: ['"', "'"],
    commentPatterns: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
    numberPattern: /\b\d+(\.\d+)?[fFdDlL]?\b/g,
    identifierPattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g,
    colorScheme: defaultColorScheme,
  },
  go: {
    name: 'Go',
    keywords: [
      'break', 'case', 'chan', 'const', 'continue', 'default', 'defer',
      'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import',
      'interface', 'map', 'package', 'range', 'return', 'select', 'struct',
      'switch', 'type', 'var'
    ],
    operators: ['+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^', '<<', '>>', ':='],
    stringDelimiters: ['"', "'", '`'],
    commentPatterns: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
    numberPattern: /\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g,
    identifierPattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g,
    colorScheme: defaultColorScheme,
  },
  rust: {
    name: 'Rust',
    keywords: [
      'as', 'break', 'const', 'continue', 'crate', 'else', 'enum', 'extern',
      'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match',
      'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self',
      'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe',
      'use', 'where', 'while'
    ],
    operators: ['+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^', '<<', '>>', '=>'],
    stringDelimiters: ['"', "'"],
    commentPatterns: [/\/\/.*$/gm, /\/\*[\s\S]*?\*\//gm],
    numberPattern: /\b\d+(\.\d+)?([eE][+-]?\d+)?[fFuUiI]?\b/g,
    identifierPattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g,
    colorScheme: defaultColorScheme,
  },
  html: {
    name: 'HTML',
    keywords: [],
    operators: [],
    stringDelimiters: ['"', "'"],
    commentPatterns: [/<!--[\s\S]*?-->/gm],
    numberPattern: /\b\d+(\.\d+)?\b/g,
    identifierPattern: /\b[a-zA-Z_-][a-zA-Z0-9_-]*\b/g,
    colorScheme: {
      ...defaultColorScheme,
      tag: colors.primary[600],
      attribute: colors.secondary[500],
    },
  },
  css: {
    name: 'CSS',
    keywords: [
      'important', 'inherit', 'initial', 'unset', 'auto', 'none', 'normal',
      'bold', 'italic', 'left', 'right', 'center', 'block', 'inline',
      'flex', 'grid', 'absolute', 'relative', 'fixed', 'static', 'sticky'
    ],
    operators: [':', ';', '{', '}', '(', ')', '[', ']'],
    stringDelimiters: ['"', "'"],
    commentPatterns: [/\/\*[\s\S]*?\*\//gm],
    numberPattern: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax|fr)?\b/g,
    identifierPattern: /\b[a-zA-Z_-][a-zA-Z0-9_-]*\b/g,
    colorScheme: {
      ...defaultColorScheme,
      property: colors.primary[500],
      function: colors.secondary[600],
    },
  },
  json: {
    name: 'JSON',
    keywords: ['true', 'false', 'null'],
    operators: [':', ',', '{', '}', '[', ']'],
    stringDelimiters: ['"'],
    commentPatterns: [],
    numberPattern: /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/g,
    identifierPattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g,
    colorScheme: {
      ...defaultColorScheme,
      property: colors.primary[500],
      string: colors.success,
    },
  },
};

/**
 * Tokenize code content for syntax highlighting
 */
export function tokenizeCode(content: string, language: string): SyntaxToken[] {
  const config = languageConfigs[language] || languageConfigs.text;
  if (!config) {
    return [{
      type: 'text',
      content,
      start: 0,
      end: content.length,
      color: defaultColorScheme.text,
    }];
  }

  const tokens: SyntaxToken[] = [];
  let position = 0;

  // Handle special cases for HTML and CSS
  if (language === 'html') {
    return tokenizeHTML(content);
  } else if (language === 'css') {
    return tokenizeCSS(content);
  } else if (language === 'json') {
    return tokenizeJSON(content);
  }

  // General tokenization for programming languages
  const lines = content.split('\n');
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let linePosition = 0;

    // Skip empty lines
    if (line.trim() === '') {
      tokens.push({
        type: 'whitespace',
        content: line,
        start: position,
        end: position + line.length,
        color: defaultColorScheme.text,
      });
      position += line.length + 1; // +1 for newline
      continue;
    }

    // Check for comments first
    let commentMatch: RegExpMatchArray | null = null;
    for (const commentPattern of config.commentPatterns) {
      const match = commentPattern.exec(line);
      if (match && match.index === 0) {
        commentMatch = match;
        break;
      }
    }

    if (commentMatch) {
      tokens.push({
        type: 'comment',
        content: commentMatch[0],
        start: position,
        end: position + commentMatch[0].length,
        color: config.colorScheme.comment,
        style: { fontStyle: 'italic' },
      });
      position += line.length + 1;
      continue;
    }

    // Tokenize the rest of the line
    const remainingLine = line;
    const lineTokens = tokenizeLine(remainingLine, config, position);
    tokens.push(...lineTokens);
    
    position += line.length + 1; // +1 for newline
  }

  return tokens;
}

/**
 * Tokenize a single line of code
 */
function tokenizeLine(line: string, config: LanguageConfig, startPosition: number): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let position = 0;

  while (position < line.length) {
    const char = line[position];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      let whitespaceEnd = position;
      while (whitespaceEnd < line.length && /\s/.test(line[whitespaceEnd])) {
        whitespaceEnd++;
      }
      
      tokens.push({
        type: 'whitespace',
        content: line.substring(position, whitespaceEnd),
        start: startPosition + position,
        end: startPosition + whitespaceEnd,
        color: config.colorScheme.text,
      });
      
      position = whitespaceEnd;
      continue;
    }

    // Check for strings
    const stringToken = tryParseString(line, position, config);
    if (stringToken) {
      tokens.push({
        ...stringToken,
        start: startPosition + stringToken.start,
        end: startPosition + stringToken.end,
      });
      position = stringToken.end - startPosition + stringToken.start;
      continue;
    }

    // Check for numbers
    const numberToken = tryParseNumber(line, position, config);
    if (numberToken) {
      tokens.push({
        ...numberToken,
        start: startPosition + numberToken.start,
        end: startPosition + numberToken.end,
      });
      position = numberToken.end - startPosition + numberToken.start;
      continue;
    }

    // Check for operators
    const operatorToken = tryParseOperator(line, position, config);
    if (operatorToken) {
      tokens.push({
        ...operatorToken,
        start: startPosition + operatorToken.start,
        end: startPosition + operatorToken.end,
      });
      position = operatorToken.end - startPosition + operatorToken.start;
      continue;
    }

    // Check for identifiers and keywords
    const identifierToken = tryParseIdentifier(line, position, config);
    if (identifierToken) {
      tokens.push({
        ...identifierToken,
        start: startPosition + identifierToken.start,
        end: startPosition + identifierToken.end,
      });
      position = identifierToken.end - startPosition + identifierToken.start;
      continue;
    }

    // Default: single character as punctuation
    tokens.push({
      type: 'punctuation',
      content: char,
      start: startPosition + position,
      end: startPosition + position + 1,
      color: config.colorScheme.punctuation,
    });
    position++;
  }

  return tokens;
}

/**
 * Try to parse a string token
 */
function tryParseString(line: string, position: number, config: LanguageConfig): SyntaxToken | null {
  const char = line[position];
  
  if (!config.stringDelimiters.includes(char)) {
    return null;
  }

  let end = position + 1;
  let escaped = false;

  while (end < line.length) {
    const currentChar = line[end];
    
    if (escaped) {
      escaped = false;
    } else if (currentChar === '\\') {
      escaped = true;
    } else if (currentChar === char) {
      end++;
      break;
    }
    
    end++;
  }

  return {
    type: 'string',
    content: line.substring(position, end),
    start: position,
    end,
    color: config.colorScheme.string,
  };
}

/**
 * Try to parse a number token
 */
function tryParseNumber(line: string, position: number, config: LanguageConfig): SyntaxToken | null {
  const remainingLine = line.substring(position);
  const match = remainingLine.match(config.numberPattern);
  
  if (!match || match.index !== 0) {
    return null;
  }

  return {
    type: 'number',
    content: match[0],
    start: position,
    end: position + match[0].length,
    color: config.colorScheme.number,
  };
}

/**
 * Try to parse an operator token
 */
function tryParseOperator(line: string, position: number, config: LanguageConfig): SyntaxToken | null {
  // Check for multi-character operators first
  const twoCharOp = line.substring(position, position + 2);
  if (config.operators.includes(twoCharOp)) {
    return {
      type: 'operator',
      content: twoCharOp,
      start: position,
      end: position + 2,
      color: config.colorScheme.operator,
    };
  }

  const oneCharOp = line[position];
  if (config.operators.includes(oneCharOp)) {
    return {
      type: 'operator',
      content: oneCharOp,
      start: position,
      end: position + 1,
      color: config.colorScheme.operator,
    };
  }

  return null;
}

/**
 * Try to parse an identifier or keyword token
 */
function tryParseIdentifier(line: string, position: number, config: LanguageConfig): SyntaxToken | null {
  const remainingLine = line.substring(position);
  const match = remainingLine.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
  
  if (!match) {
    return null;
  }

  const content = match[0];
  const isKeyword = config.keywords.includes(content);
  
  return {
    type: isKeyword ? 'keyword' : 'identifier',
    content,
    start: position,
    end: position + content.length,
    color: isKeyword ? config.colorScheme.keyword : config.colorScheme.identifier,
    style: isKeyword ? { fontWeight: 'bold' } : undefined,
  };
}

/**
 * Specialized tokenizer for HTML
 */
function tokenizeHTML(content: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let position = 0;

  const tagPattern = /<\/?[^>]+>/g;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(content)) !== null) {
    // Add text before the tag
    if (match.index > position) {
      tokens.push({
        type: 'text',
        content: content.substring(position, match.index),
        start: position,
        end: match.index,
        color: defaultColorScheme.text,
      });
    }

    // Add the tag
    tokens.push({
      type: 'tag',
      content: match[0],
      start: match.index,
      end: match.index + match[0].length,
      color: defaultColorScheme.tag,
    });

    position = match.index + match[0].length;
  }

  // Add remaining text
  if (position < content.length) {
    tokens.push({
      type: 'text',
      content: content.substring(position),
      start: position,
      end: content.length,
      color: defaultColorScheme.text,
    });
  }

  return tokens;
}

/**
 * Specialized tokenizer for CSS
 */
function tokenizeCSS(content: string): SyntaxToken[] {
  // Simplified CSS tokenization
  return tokenizeCode(content, 'text'); // Fallback to basic tokenization
}

/**
 * Specialized tokenizer for JSON
 */
function tokenizeJSON(content: string): SyntaxToken[] {
  // Simplified JSON tokenization
  return tokenizeCode(content, 'text'); // Fallback to basic tokenization
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(languageConfigs);
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return language in languageConfigs;
}

/**
 * Get language configuration
 */
export function getLanguageConfig(language: string): LanguageConfig | null {
  return languageConfigs[language] || null;
}