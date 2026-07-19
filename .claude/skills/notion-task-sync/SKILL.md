---
name: notion-task-sync
description: このリポジトリの TODO.md（サイトリニューアルのタスク計画）とNotionの「ブログサイト制作タスク」データベースを同期させたいときに使う。ユーザーが「Notionに反映して」「タスクをNotionに登録して」「Notionのタスク状況を更新して」と言った場合や、TODO.mdのチェックリスト・章立てを大きく変更した直後は、明示的に頼まれていなくても同期がズレていないか確認すること。
---

## 対象データベース

Notion上に作成済みの「ブログサイト制作タスク」データベース。

Database URL・Data source IDはこのリポジトリにベタ書きせず、ホームディレクトリの`~/.claude/notion-databases.json`の`blog_task_sync`キー（`url`, `data_source_id`）を読み込んで使う。

- スキーマ: `Name`（タイトル）, `Status`（未着手/進行中/完了）, `Order`（数値、`TODO.md` §11の着手順序に対応）, `TODO参照`（テキスト、関連するTODO.mdのセクション番号）
- 各タスクページの本文には、対応するTODO.mdセクションのチェックリスト項目をNotionのto-doブロック（`- [ ] ...`）として転記してある。

`~/.claude/notion-databases.json`が無い・`blog_task_sync`キーが無い・URLが変わっている・データベースが見つからない場合は `mcp__claude_ai_Notion__notion-search`（クエリ例: "ブログサイト制作タスク"）で検索し直す。正しいDBが判明したら`~/.claude/notion-databases.json`の`blog_task_sync`キーを新しいURL/IDで更新しておく。

## 前提: Notion MCPを使う

この同期処理はすべて **Notion MCP（`mcp__claude_ai_Notion__*` ツール群）経由**で行う。独自スクリプトやNotion REST APIの直接呼び出しは行わない。これらのツールは会話開始時点では名前だけが見えるdeferred toolのことがあるため、使う前に `ToolSearch`（例: `select:mcp__claude_ai_Notion__notion-fetch,mcp__claude_ai_Notion__notion-update-page,mcp__claude_ai_Notion__notion-create-pages,mcp__claude_ai_Notion__notion-search`）でスキーマを読み込んでから呼び出すこと。Notion連携（MCP接続）自体が無効/未接続の環境では、この手順は実行できないので、その場合は正直にユーザーへ伝える。

## 手順

1. **`TODO.md` を読む**: 特に §11「推奨する着手順序」（タスクの粒度の基準）と、各章のチェックリスト（`- [ ]` / `- [x]`）を確認する。
2. **Notion側の現状を取得する**: `mcp__claude_ai_Notion__notion-fetch` で上記データベース（またはdata source ID）を取得し、既存タスクの一覧（Name, Status, Order）を確認する。
3. **差分を見る**:
   - `TODO.md` 側でチェックが入った（`- [x]`）項目に対応するNotionタスクがまだ「未着手」または「進行中」なら、Statusを更新する候補にする。全チェック項目が完了した章の対応タスクは「完了」にする。一部だけ完了している場合は「進行中」にする。
   - `TODO.md` に新しい章・タスクが追加されていて、Notion側に対応するページが無ければ、新規ページ作成の候補にする（Orderは§11の並びに合わせる。§11に無い細かいタスクは、関連する既存タスクページの本文に子to-doとして追記する方が望ましく、新規ページを乱発しない）。
   - `TODO.md` 側で削除・変更された内容がNotion側に残っている場合は、ユーザーに確認してから更新する（黙って消さない）。
4. **反映する**:
   - 既存ページの更新には `mcp__claude_ai_Notion__notion-update-page` を使う。`command: "update_properties"` でStatus等のプロパティ変更、`command: "update_content"`（`content_updates`に`old_str`/`new_str`のペア）で本文中のto-doブロックのチェック状態（`- [ ]` ↔ `- [x]`）を差分更新する。
   - 新規タスクの追加には `mcp__claude_ai_Notion__notion-create-pages` を使い、`parent` に `{"type": "data_source_id", "data_source_id": "<~/.claude/notion-databases.jsonのblog_task_sync.data_source_idの値>"}` を指定する。
5. **反映内容をユーザーに要約して報告する**（更新したタスク名・Status変更・追加したタスク一覧）。Notionへの書き込みは実際にワークスペースを変更する操作なので、大量の変更になる場合は事前に方針をユーザーに一言確認してから実行する。

## 注意点

- タスクの粒度は「1タスク=1ページ」を基本とし、`TODO.md`の個々のチェックボックス1つ1つをページ化しない（§11の15ステップ程度の粒度を保つ）。チェックボックス単位の詳細はページ本文のto-doブロックで表現する。
- `TODO.md`が実装の進行に伴って章番号・内容を変える可能性がある。`TODO参照`列の値が古くなっていたら合わせて更新する。
- Notion MCPツールの内部IDやツール呼び出し結果に含まれるメタ情報をユーザーに見せる必要はない。ユーザーには「Notion上のタスク名」「変更内容」だけを分かりやすく伝える。
