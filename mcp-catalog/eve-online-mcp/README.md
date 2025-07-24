# EVE Online Market MCP Server
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kongyo2/eve-online-mcp)
[![smithery badge](https://smithery.ai/badge/@kongyo2/eve-online-mcp)](https://smithery.ai/server/@kongyo2/eve-online-mcp)

このMCPサーバーは、EVE Onlineのマーケットデータにアクセスするためのインターフェースを提供します。ESI（EVE Swagger Interface）APIを使用して、リアルタイムの市場データを取得できます。

## 認証とレート制限

このサーバーは現在、パブリックなマーケットデータのみを取得するため、ESI認証は必要ありません。ただし、以下の制限と仕様があります：

1. **レート制限**
   - ESIには1分あたりのエラー制限があります
   - サーバーは自動的にレート制限を監視し、制限に達した場合はエラーを返します
   - ヘッダー`x-esi-error-limit-remain`と`x-esi-error-limit-reset`で制限状態を確認できます

2. **ユーザーエージェント**
   - ESIの推奨事項に従い、適切なユーザーエージェントを設定しています
   - 形式: `eve-online-mcp/1.0 (github.com/your-username/eve-online-mcp)`

3. **エラーハンドリング**
   - APIエラーは適切にキャプチャされ、わかりやすいメッセージとして返されます
   - ESIからのエラー詳細情報も含まれます

## 機能

サーバーは以下の3つの主要な機能を提供します：

1. **市場価格の取得** (`get-market-prices`)
   - EVE Online内のすべてのアイテムの調整価格と平均価格を取得
   - 返り値には `type_id`、`adjusted_price`、`average_price` が含まれます

2. **市場注文の取得** (`get-market-orders`)
   - 特定のリージョンの市場注文を取得
   - オプションで特定のアイテムタイプやオーダータイプ（買い/売り）でフィルタリング可能
   - 各注文には価格、数量、場所などの情報が含まれます

3. **市場履歴の取得** (`get-market-history`)
   - 特定のリージョンの特定のアイテムの市場履歴を取得
   - 日ごとの最高価格、最低価格、平均価格、取引量などを取得可能

4. **グループ化された市場データの取得** (`get-market-groups`)
   - 特定のリージョンと特定のアイテムタイプのグループ化された市場データを取得
   - 買い注文と売り注文それぞれの統計情報（平均価格、最高/最低価格、取引量など）を提供

5. **構造体の市場注文取得** (`get-structure-orders`)
   - 特定の構造体（ステーション、シタデルなど）の全市場注文を取得
   - ページネーション対応で大量のデータを効率的に取得可能

6. **地域の取引所統計取得** (`get-market-stats`)
   - 特定の地域の市場統計情報を取得
   - 取引量、価格トレンド、市場活性度などの指標を提供

7. **構造体の特定アイテム注文取得** (`get-structure-type-orders`)
   - 特定の構造体における特定のアイテムタイプの全市場注文を取得
   - より詳細な市場分析が可能

## セットアップ

### Installing via Smithery

To install eve-online-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@kongyo2/eve-online-mcp):

```bash
npx -y @smithery/cli install @kongyo2/eve-online-mcp --client claude
```

1. 依存パッケージのインストール：
   ```bash
   npm install
   ```

2. プロジェクトのビルド：
   ```bash
   npm run build
   ```

3. サーバーの起動：
   ```bash
   npm start
   ```

## VS Code統合

このプロジェクトはVS Code用の設定が含まれています：

- `.vscode/settings.json`: MCPサーバーの設定
- `.vscode/tasks.json`: ビルドと実行用のタスク

以下のタスクが利用可能です：
- "Build EVE Online Market MCP Server": プロジェクトをビルド
- "Run EVE Online Market MCP Server": MCPサーバーを起動

## 使用例

1. 市場価格の取得：
```typescript
// すべてのアイテムの価格を取得
const prices = await callTool("get-market-prices");
```

2. 市場注文の取得：
```typescript
// The Forge（リージョンID: 10000002）のTritanium（タイプID: 34）の注文を取得
const orders = await callTool("get-market-orders", {
  region_id: 10000002,
  type_id: 34,
  order_type: "all"
});
```

3. 市場履歴の取得：
```typescript
// The ForgeのTritaniumの市場履歴を取得
const history = await callTool("get-market-history", {
  region_id: 10000002,
  type_id: 34
});
```

4. グループ化された市場データの取得：
```typescript
// The ForgeのTritaniumのグループ化された市場データを取得
const marketGroups = await callTool("get-market-groups", {
  region_id: 10000002,
  type_id: 34
});
```

5. 構造体の市場注文取得：
```typescript
// 構造体ID: 1234567890 の全市場注文を取得
const structureOrders = await callTool("get-structure-orders", {
  structure_id: 1234567890,
  page: 1
});
```

6. 地域の取引所統計取得：
```typescript
// The Forgeの市場統計情報を取得
const marketStats = await callTool("get-market-stats", {
  region_id: 10000002
});
```

7. 構造体の特定アイテム注文取得：
```typescript
// 構造体ID: 1234567890 におけるTritaniumの全市場注文を取得
const typeOrders = await callTool("get-structure-type-orders", {
  structure_id: 1234567890,
  type_id: 34,
  page: 1
});
```

## 認証設定

## EVE Online SSO設定

1. [EVE Online Developers Portal](https://developers.eveonline.com/)でアプリケーションを登録
2. 以下のスコープを要求:
   - `esi-markets.structure_markets.v1`
   - `esi-markets.read_character_orders.v1`

3. 取得したクライアントIDとシークレットを`.env`ファイルに設定:
   ```bash
   cp .env.example .env
   # .envファイルを編集して認証情報を設定
   ```

## 認証フロー

1. 認証URLの取得:
```typescript
const authUrlResponse = await callTool("get-auth-url", {
  state: "unique-state-string"
});
// ユーザーをauthUrlResponseのURLにリダイレクト
```

2. 認証コードの交換:
```typescript
const authResponse = await callTool("authenticate", {
  code: "authorization-code-from-callback"
});
// 返されたトークンを保存
```

3. トークンの更新:
```typescript
const refreshResponse = await callTool("refresh-token", {
  refresh_token: "saved-refresh-token"
});
// 新しいトークンで更新
```

## 構造体アクセス

認証が必要な構造体のマーケットデータにアクセスする場合：

1. 適切なスコープを持つトークンを取得
2. makeESIRequestの呼び出し時にトークンを指定:
```typescript
const structureOrders = await callTool("get-structure-orders", {
  structure_id: 1234567890,
  page: 1,
  token: "your-access-token"
});
```

## 注意事項

1. **構造体関連のエンドポイント**
   - 構造体関連のエンドポイントにアクセスするには、適切な権限を持つESIトークンが必要です
   - アクセス権のない構造体のデータは取得できません

2. **ページネーション**
   - 大量のデータを返すエンドポイントはページネーションを使用します
   - `page`パラメータで特定のページを指定できます（1から開始）

3. **キャッシュ**
   - ESIのレスポンスはサーバー側でキャッシュされます
   - キャッシュ期間はエンドポイントによって異なります
   - キャッシュ情報はレスポンスヘッダーで確認できます
