"use client";

// Component for displaying expense summary
import { PersonExpense, ReceiptItem, ItemAllocation } from "@/types";
import { useState } from "react";

interface ExpenseSummaryProps {
  expenses: PersonExpense[];
  receiptTotal?: number; // Total from original receipt
  items?: ReceiptItem[]; // All receipt items
  allocations?: ItemAllocation[]; // Item allocations
}

export default function ExpenseSummary({
  expenses,
  receiptTotal,
  items,
  allocations,
}: ExpenseSummaryProps) {
  // Calculate total from expenses (sum of all people's totals)
  const total = expenses.reduce((sum, expense) => sum + expense.total, 0);

  // Calculate allocated total from actual items that have been allocated
  // This ensures accuracy and matches the bill total when all items are allocated
  let allocatedTotal = 0;
  if (items && allocations) {
    const allocatedItemIds = new Set(allocations.map((alloc) => alloc.itemId));
    allocatedTotal = items
      .filter((item) => allocatedItemIds.has(item.id))
      .reduce((sum, item) => {
        // Item.price from AI is already the total price (includes quantity if quantity > 1)
        return sum + item.price;
      }, 0);
  } else {
    // Fallback: use sum from expenses (may have floating point errors)
    allocatedTotal = Math.round(total * 100) / 100;
  }
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (personId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(personId)) {
      newExpanded.delete(personId);
    } else {
      newExpanded.add(personId);
    }
    setExpandedCards(newExpanded);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có dữ liệu chia tiền. Hãy phân bổ món ăn cho từng người.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Kết quả chia tiền
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Mỗi người trả theo món ăn đã chọn, sau đó trừ đi số tiền đã góp
        </p>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => {
          const isExpanded = expandedCards.has(expense.personId);
          const hasItems = expense.items.length > 0;

          return (
            <div
              key={expense.personId}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                  <h4 className="font-medium text-gray-900">
                    {expense.personName}
                  </h4>
                  {hasItems && (
                    <button
                      onClick={() => toggleCard(expense.personId)}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      title={isExpanded ? "Ẩn món ăn" : "Hiện món ăn"}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Tổng phải trả:
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {expense.total.toLocaleString("vi-VN")} VND
                    </div>
                  </div>
                </div>
              </div>

              {/* Show contribution and remaining amount */}
              <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                {expense.contribution !== undefined &&
                  expense.contribution > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Đã góp:</span>
                      <span className="text-green-600 font-medium">
                        -{expense.contribution.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  )}
                {expense.remaining !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Số tiền còn lại:
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        expense.remaining > 0
                          ? "text-red-600"
                          : expense.remaining < 0
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {expense.remaining > 0
                        ? `Còn thiếu: ${expense.remaining.toLocaleString(
                            "vi-VN"
                          )} VND`
                        : expense.remaining < 0
                        ? `Còn thừa: ${Math.abs(
                            expense.remaining
                          ).toLocaleString("vi-VN")} VND`
                        : "Đã đủ"}
                    </span>
                  </div>
                )}
              </div>

              {/* Collapsible items list */}
              {hasItems && (
                <div
                  className={`mt-2 space-y-1 transition-all duration-200 ${
                    isExpanded ? "block" : "hidden"
                  }`}
                >
                  <p className="text-xs text-gray-600 font-medium">Món ăn:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {expense.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>{item.price.toLocaleString("vi-VN")} VND</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-2">
        {receiptTotal && receiptTotal !== allocatedTotal && (
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-600">Tổng hoá đơn:</span>
            <span className="text-gray-900 font-medium">
              {receiptTotal.toLocaleString("vi-VN")} VND
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold text-gray-900">
              Tổng giá trị đã phân bổ:
            </span>
            <span className="text-xs text-gray-500 ml-2">
              (Tổng giá trị các món đã được chia cho người)
            </span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            {allocatedTotal.toLocaleString("vi-VN")} VND
          </span>
        </div>
        {receiptTotal && receiptTotal !== allocatedTotal && (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Thuế/Phụ phí phân bổ:</span>
              <span className="text-gray-900 font-medium">
                {(receiptTotal - allocatedTotal).toLocaleString("vi-VN")} VND
              </span>
            </div>
          </>
        )}
        {(() => {
          const totalContributed = expenses.reduce(
            (sum, e) => sum + (e.contribution || 0),
            0
          );

          // Tổng số tiền mọi người phải thanh toán = tổng giá trị đã phân bổ
          // (hoặc tổng bill nếu đã phân bổ hết)
          const totalToPay = allocatedTotal;
          const totalRemaining = totalToPay - totalContributed;

          return (
            <>
              {totalContributed > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tổng đã góp:</span>
                  <span className="text-gray-900 font-medium">
                    {totalContributed.toLocaleString("vi-VN")} VND
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Còn thiếu:</span>
                <span
                  className={`font-semibold ${
                    totalRemaining > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {totalRemaining > 0
                    ? `${totalRemaining.toLocaleString("vi-VN")} VND`
                    : totalRemaining < 0
                    ? `Thừa ${Math.abs(totalRemaining).toLocaleString(
                        "vi-VN"
                      )} VND`
                    : "Đã đủ"}
                </span>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
