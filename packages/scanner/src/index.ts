import {
  ProjectOptions,
  Project,
  ts,
  VariableDeclarationKind,
  Node,
} from 'ts-morph';
import fg from 'fast-glob';
import getEmojiRegex from 'emoji-regex';
import { stripQuote } from './utils';

const emojiRegex = getEmojiRegex();

export const defaultIgnoreText = [
  //
  '@',
  '#',
  '&',
  '*',
  '/',
  '%',
  ':',
  '+',
  '-',
  ' ',
];

export const defaultIgnoreFiles = ['./node_modules'];

export { IndentationText } from 'ts-morph';

export interface ScanOptions {
  /**
   * Ts project
   *
   * @example
   * {
   *   project: {
   *     tsConfigFilePath,
   *   },
   * }
   */
  project?: ProjectOptions;
  ignoreFiles?: string[];
  ignoreText?: string[];
  autoImport?: boolean;
  verbose?: boolean;
}

export async function scanUntranslatedText(
  source: string,
  options?: ScanOptions
) {
  const project = new Project(options?.project);
  const ignoreText = options?.ignoreText ?? defaultIgnoreText;
  const autoImport = options?.autoImport ?? false;
  const ignoreFiles = options?.ignoreFiles ?? undefined;
  const verbose = options?.verbose ?? false;

  const fileList = await fg(source, {
    ignore: ignoreFiles,
    cwd: process.cwd(),
  });

  const res: Record<string, string[]> = {};

  for (const filePath of fileList) {
    const sourceFile = project.getSourceFileOrThrow(filePath);

    if (!sourceFile) {
      continue;
    }

    const untranslatedNode: Node[] = [];

    const appendRes = (node: Node) => {
      const text = stripQuote(node.getText().trim());
      if (ignoreText.includes(text)) {
        return;
      }

      // is pure emoji
      if (text.replace(new RegExp(emojiRegex, 'g'), '') === '') {
        return;
      }

      untranslatedNode.push(node);
    };

    if (verbose) {
      console.log('Scan:', sourceFile.getFilePath());
    }

    //#region match rule

    // Found jsx text <div>foooo</div>
    sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxText).forEach((item) => {
      const hasTransParent = item.getFirstAncestor(
        (node) =>
          node.isKind(ts.SyntaxKind.JsxElement) &&
          node.getOpeningElement().getTagNameNode().getText() === 'Trans'
      );

      if (hasTransParent) {
        // ignore <Trans>foooo</Trans> case
        return;
      }

      const text = item.getText().trim();
      if (text !== '') {
        appendRes(item);
      }
    });

    // find object like: {title: 'foo'}
    sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment)
      .forEach((item) => {
        if (['title', 'label', 'description'].includes(item.getName())) {
          const initializer = item.getInitializer();
          if (
            initializer &&
            initializer.getKind() === ts.SyntaxKind.StringLiteral
          ) {
            appendRes(initializer);
          }
        }
      });

    // find object like: <div title="fooo" />
    sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.JsxAttribute)
      .forEach((item) => {
        const name = item.getNameNode();
        if (
          name.isKind(ts.SyntaxKind.Identifier) &&
          [
            'title',
            'label',
            'description',
            'placeholder',
            'aria-label',
            'aria-labelledby',
          ].includes(name.getText())
        ) {
          const initializer = item.getInitializer();
          if (
            initializer &&
            initializer.getKind() === ts.SyntaxKind.StringLiteral
          ) {
            appendRes(initializer);
          }
        }
      });

    // found all string in jsx expression, for example: <div>{'foooo'}</div>
    sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.JsxExpression)
      .forEach((item) => {
        const strChildren = item.getDescendantsOfKind(
          ts.SyntaxKind.StringLiteral
        );
        if (strChildren.length > 0) {
          strChildren
            .filter((s) => {
              if (
                [
                  ts.SyntaxKind.CallExpression,
                  ts.SyntaxKind.JsxAttribute,
                  ts.SyntaxKind.PropertyAssignment,
                  ts.SyntaxKind.ArrayLiteralExpression,
                  ts.SyntaxKind.BinaryExpression,
                  ts.SyntaxKind.CaseClause,
                ].includes(s.getParent().getKind())
              ) {
                /**
                 * skip those case:
                 * - function call
                 * - jsx attribute value
                 * - props key(value has been added in above case)
                 * - array(no translation case wrap with array, but chakra ui has much responsive use)
                 * - switch case
                 */
                return false;
              }

              const parents = s.getAncestors();
              if (
                parents.some((p) => p.getKind() === ts.SyntaxKind.JsxAttribute)
              ) {
                /**
                 * skip those case:
                 * - <div position={'absolute'} />
                 * - <div position={cond ? 'absolute' : 'relative'} />
                 */
                return false;
              }

              return true;
            })
            .forEach((c) => {
              appendRes(c);
            });
        }
      });

    //#endregion

    if (untranslatedNode.length > 0) {
      res[filePath] = untranslatedNode.map((n) => {
        let word = n.getText().trim();
        if (verbose) {
          const { line, column } = sourceFile.getLineAndColumnAtPos(n.getPos());
          word += ` at ${line}:${column}`;
        }

        return word;
      });

      if (autoImport) {
        // only fix simple node

        let hasAddedHook = false;
        untranslatedNode.forEach((node) => {
          const func = node.getFirstAncestorByKind(ts.SyntaxKind.ArrowFunction);

          if (
            func &&
            func.getBody().isKind(ts.SyntaxKind.Block) &&
            !func
              .getAncestors()
              .some((node) => node.isKind(ts.SyntaxKind.JsxExpression)) &&
            func
              .getFirstAncestorByKind(ts.SyntaxKind.VariableStatement)
              ?.getParent() === sourceFile // make sure this is root level arrow function
          ) {
            // try to find useTranslation
            const declarations = func.getVariableDeclarations();
            const isAddedUseTranslation = declarations.some((declaration) => {
              const initializer = declaration.getInitializerIfKind(
                ts.SyntaxKind.CallExpression
              );
              if (
                initializer &&
                initializer.getExpression().getText() === 'useTranslation'
              ) {
                // has been add
                return true;
              }

              return false;
            });

            if (!isAddedUseTranslation) {
              if (
                ![
                  ts.SyntaxKind.ParenthesizedExpression,
                  ts.SyntaxKind.JsxElement,
                ].includes(func.getBody().getKind())
              ) {
                // not been add, add useTranslation
                func.insertVariableStatement(0, {
                  declarationKind: VariableDeclarationKind.Const,
                  declarations: [
                    {
                      name: '{ t }',
                      initializer: 'useTranslation()',
                    },
                  ],
                });
                hasAddedHook = true;
              }
            }
          }
        });

        if (hasAddedHook) {
          sourceFile.addImportDeclaration({
            namedImports: [
              {
                name: 'useTranslation',
              },
            ],
            moduleSpecifier: '@i18next-toolkit/react',
          });
        }

        await sourceFile.save();
      }
    }
  }

  return res;
}
