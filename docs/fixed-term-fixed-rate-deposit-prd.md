# Unitus 固定期限固定利率存款产品需求文档

## 1. 产品概述

基于 Unitus Lending 增加固定期限、固定利率存款产品。

本文仅描述与现有 Unitus Lending 的差异。存款、利息、额度、暂停等已有机制继续沿用，不做额外修改。

## 2. 产品周期

### 2.1 募集期

- 用户可以随时存款和赎回。
- 募集期不计利息。

### 2.2 计息期

- 从起息时间开始，到结息时间结束。
- 产品期限为 3 个月。
- 产品日期需保证起息时间、每周锚点和结息时间完整对齐，不产生不足一周的结算周期。
- 使用固定存款利率。
- 起息后仍允许存款，但不能超过 Unitus 已有存款上限。
- 普通 redeem 在计息期内暂停。

### 2.3 结息后

- 结息后停止计息。
- 普通 redeem 恢复。
- 用户无需提交 withdrawal request，可以直接赎回全部可用存款资金。

## 3. 每周取款

### 3.1 每周锚点

- 使用 UTC timestamp。
- 每周设置一个固定取款锚点。
- 用户在锚点前提交的请求，在对应锚点后允许领取。
- withdrawal request 在锚点前继续计息，并在锚点时间准确停止计息。
- settlement 是否延迟不影响用户应得利息。

### 3.2 Withdrawal request

- 用户以 underlying 金额提交请求；合约内部仍以 shares 记账。
- 请求不可撤销。
- 同一用户可以在同一 Epoch 多次提交请求。
- 多次请求累计为该用户在该 Epoch 的总 shares。
- 用户只能请求其 accruing 状态的可用金额。
- pending shares 不能转移、重复请求或通过普通 redeem 赎回。
- 前端不向用户展示 shares 或 Epoch，用户只处理 underlying 金额。

### 3.3 最后一个周期

- 结息时间同时是最后一个周锚点。
- 当用户请求对应的下一个锚点为结息时间时，不再接受 withdrawal request。
- 最后一个周期将操作入口显示为 Withdraw，但禁止提交新请求。
- 产品端提示“最后一个周期将在结息后开放取款”，结息后可直接 redeem。

## 4. Epoch settlement

- 每个 Epoch 聚合该周期的全部 withdrawal shares。
- settlement 为 permissionless。
- 必须一次性结算该 Epoch 的全部 shares，不支持部分结算。
- settlement 前必须确保 Unitus 有足够 underlying。
- underlying 不足时，整个 settlement 失败，任何人可在流动性恢复后重试。
- 不要求在锚点前预留流动性。
- 用户调用 claim 时，如果 Epoch 尚未 settlement，可以先触发 settlement。
- settlement 不遍历用户。
- settlement 成功后，用户分别 claim 自己的份额。

## 5. 其他规则

- 该产品存款不能作为抵押品，LTV 为 0。
- 暂不考虑额外 Unitus reward。
- 测试和部署会保留并锁定极小 supply，避免最低 supply 限制问题。
- 未通过 withdrawal request 而直接转入 Queue 的 shares 不记入任何 Epoch，也不提供恢复。
- 用户未领取的结算资产不得被管理员归集。
- Epoch surplus 先保留在对应 Epoch，结息后由管理员统一归集。

## 6. 利息结算规则

- 用户应得金额按照 Epoch 锚点时间确定。
- settlement 延迟不会增加用户利息。
- settlement 时实际赎回金额超过用户应得金额的部分作为 Epoch surplus。
- surplus 保留在 Epoch，结息后由管理员归集。
- 产品运行期间不得切换利息截止规则。

## 7. 前端展示要求

### 7.1 产品信息

- 产品名称为 `Conflux RWA - FnL S1`。
- Collateral 显示为 `Fin Loop`。
- Vault 详情页不展示 APY 历史图表，该区域用于展示 withdrawal requests。

### 7.2 用户余额

- `USDT Supplied` 显示用户当前存款总额。
- 总额拆分为 Pending、Claimable 和 Accruing 三部分，全部使用 underlying 金额。
- `Available to Request` 等于 Accruing 金额。
- 用户提交请求后，对应金额从 Accruing 进入 Pending。
- 用户 claim 后，对应金额从 Claimable 和 `USDT Supplied` 中扣除。

### 7.3 Withdrawal requests

- Withdrawal requests 区域在计息期、最后一个周期和结息后始终保留。
- 根据实际数据最多展示一个合并后的 Pending 入口和一个合并后的 Claimable 入口。
- Pending 仅显示请求金额和预计可领取时间，不显示锚点预计到账金额；提示最终结算金额会略高于请求金额。
- Claimable 仅显示准确可领取金额和实际可领取时间，不再展示原请求金额。
- 不展示 Epoch 编号、shares 数量或 open 数量。
- 无数据时展示与状态匹配的空状态，例如“暂无进行中的取款请求”“可领取资金已全部领取”或“剩余资金可直接取款”。

### 7.4 生命周期状态

- Regular epoch：显示 `Withdraw Request`，允许基于 Accruing 金额提交请求。
- Last epoch：入口显示为 `Withdraw`，禁止提交请求，并提示结息后开放取款。
- Matured：入口显示为 `Withdraw`，允许直接取出全部可用资金。
- 前端参考原型提供 Regular epoch、Last epoch 和 Matured 状态切换栏；该切换栏仅用于开发演示，不属于生产功能。

---

# 参考实现方案

## 1. 整体结构

增加一个与目标 Unitus 市场绑定的 Withdrawal Queue。

Queue 负责：

- 接收并托管 pending shares；
- 按周记录用户和 Epoch 的 shares；
- 在 redeem 暂停期间执行白名单赎回；
- 聚合 settlement；
- 保存已结算 underlying；
- 处理用户 claim；
- 记录 Epoch surplus。

## 2. Request 记账

每次 withdrawal request：

1. 确定请求所属的下一个 Epoch。
2. 将用户请求的 shares 转入 Queue。
3. 累加用户在该 Epoch 的 shares。
4. 累加该 Epoch 的总 shares。

同一用户对同一 Epoch 的多次请求直接合并，不保存独立请求列表。

Queue 同时记录已记账 shares。直接转入 Queue、但未经过 request 的 shares 不参与任何 settlement 或 claim。

## 3. 白名单 Queue redeem

计息期内，普通用户继续受 Unitus `redeemPaused` 限制。

为每个相关市场配置唯一的 Withdrawal Queue：

- 市场未暂停 redeem 时，沿用正常 Unitus redeem。
- 市场暂停 redeem 时，仅允许指定 Queue 赎回 Queue 自己持有的 shares。
- Queue 不能直接赎回用户地址中的 shares。
- 白名单只绕过 `redeemPaused`，不绕过其他 Unitus 检查。
- Queue 配置由现有治理或 timelock 管理。

## 4. Settlement

任何人都可以在锚点后 settlement：

1. 确认 Epoch 已到锚点且尚未结算。
2. 获取 Epoch 的总 pending shares。
3. 按锚点时间确定该 Epoch 的用户可领取总额。
4. 确认 underlying 流动性充足。
5. 由 Queue 聚合赎回全部 Epoch shares。
6. 将实际赎回金额超出用户可领取总额的部分记录为 Epoch surplus。
7. 标记 Epoch 已结算。

任一条件不满足时，整个操作失败，不修改 Epoch 状态。

如果用户调用 claim 时 Epoch 尚未结算，则先执行上述 settlement；失败时 claim 一并失败。

settlement 延迟不改变用户可领取总额，也不增加用户利息。

## 5. Claim

Epoch 结算后，用户按照以下比例领取：

```text
用户可领取金额
= Epoch 用户可领取总额
× 用户 Epoch shares
÷ Epoch 总 shares
```

Claim 采用用户主动领取方式，不遍历 Epoch 用户。

每个用户在每个 Epoch 的 shares 只能领取一次。舍入产生的剩余金额在 Epoch 全部领取完成后按 surplus 处理。

## 6. 结息处理

结息后：

- Unitus 恢复普通 redeem。
- 用户未进入 pending 状态的 shares 可以直接 redeem。
- 已进入历史 Epoch 的 pending shares 继续通过 Queue settlement 和 claim。
- Queue 保留足够 underlying 覆盖所有未领取用户资产。
- 管理员只能归集显式记录的 Epoch surplus，不能按 Queue 的全部余额归集。
