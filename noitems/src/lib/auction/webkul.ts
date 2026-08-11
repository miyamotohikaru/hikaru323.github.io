import "server-only";

import { webkul } from "./config";
import type { AuctionProvider, AuctionState, PlaceBidResult } from "./types";

/**
 * Webkul の Auction アプリに繋ぐときは、このファイルだけを実装する。
 *
 * 必要な環境変数（Vercel に登録する）
 *   WEBKUL_AUCTION_ENDPOINT  … アプリのAPIベースURL
 *   WEBKUL_API_KEY           … 認証キー
 *   WEBKUL_AUCTION_ID        … このロットに割り当てられたオークションID
 *
 * これらが揃うと lib/auction/index.ts が自動でこちらを選ぶ。
 * レスポンスの形は AuctionState に合わせて写し替えること
 * （UI側は AuctionState しか知らないので、変換をここで閉じる）。
 *
 * 写し替えで落としてはいけないもの:
 *   serverNow  … 端末の時計を信じないための基準。必ずサーバー時刻を入れる
 *   viewer     … 「自分が最高額か」。Webkul の顧客IDと突き合わせる
 *   maxBid     … 桁の打ち間違いを止める上限。config の bidCeiling を使ってよい
 *   startsAt   … 開始前のページを出すのに要る
 *
 * Webkul は proxy bid（上限額を預けて自動で競る）を持っている。
 * 使うなら AuctionState に myProxyMax を足し、入札ダイアログに項目を1つ増やす。
 */

function notWired(): never {
  throw new Error(
    "Webkul provider is not implemented yet. " +
      "WEBKUL_* の環境変数を設定し、webkul.ts の TODO を埋めてください。",
  );
}

export const webkulAuctionProvider: AuctionProvider = {
  name: "webkul",

  async load(): Promise<AuctionState> {
    // TODO: GET `${webkul.endpoint}/auctions/${webkul.auctionId}`
    //       → AuctionState へ写す
    void webkul;
    notWired();
  },

  async placeBid(_amount: number, _requestId: string): Promise<PlaceBidResult> {
    // TODO: POST `${webkul.endpoint}/auctions/${webkul.auctionId}/bids`
    //       requestId は冪等キーとして送る（再送で二重入札にならないように）
    //       失敗時は BidErrorCode に振り分け、message に日本語を入れ、
    //       できれば最新の state も一緒に返す
    void _amount;
    void _requestId;
    notWired();
  },
};
