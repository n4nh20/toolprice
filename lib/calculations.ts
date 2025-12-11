// Calculate expense splitting logic
// Logic:
// 1. Tính số tiền mỗi người phải trả dựa trên món ăn họ ăn (phân bổ công bằng)
// 2. Trừ đi số tiền đã góp trước
// 3. Nếu ai đó góp dư (thừa), số tiền dư sẽ được chia đều cho những người còn lại
//    và trừ vào số tiền của họ phải trả
//
// Ví dụ: Bill 5 triệu
// - An: ăn món 2 triệu, đã góp 3 triệu → dư 1 triệu
// - Bình: ăn món 3 triệu, chưa góp
// - Cường: ăn món 1 triệu, chưa góp
//
// Sau khi trừ góp: An dư 1M, Bình thiếu 3M, Cường thiếu 1M
// Số tiền dư 1M của An chia đều cho Bình và Cường: 500k mỗi người
// Kết quả: An dư 0, Bình thiếu 2.5M, Cường thiếu 500k
import { ReceiptItem, Person, ItemAllocation, PersonExpense } from "@/types";

export function calculateExpenses(
  items: ReceiptItem[],
  people: Person[],
  allocations: ItemAllocation[],
  receiptTotal?: number
): PersonExpense[] {
  // Create a map of item allocations
  const itemAllocationMap = new Map<string, string[]>();
  allocations.forEach((allocation) => {
    itemAllocationMap.set(allocation.itemId, allocation.personIds);
  });

  // Initialize person expenses
  const personExpenses = new Map<string, PersonExpense>();
  people.forEach((person) => {
    personExpenses.set(person.id, {
      personId: person.id,
      personName: person.name,
      items: [],
      total: 0,
      contribution: person.contribution || 0,
    });
  });

  // Distribute items to people based on what they ate
  // This ensures fair distribution: each person pays for what they consumed
  items.forEach((item) => {
    const personIds = itemAllocationMap.get(item.id) || [];

    if (personIds.length === 0) {
      // If no one is allocated, skip this item
      return;
    }

    // Item.price from AI is already the total price (price * quantity if quantity > 1)
    // So we use it directly without multiplying by quantity again
    const itemTotalPrice = item.price;

    // Split price equally among allocated people (fair split)
    const pricePerPerson = itemTotalPrice / personIds.length;

    personIds.forEach((personId) => {
      const expense = personExpenses.get(personId);
      if (expense) {
        expense.items.push({
          ...item,
          price: pricePerPerson,
        });
        expense.total += pricePerPerson;
      }
    });
  });

  // Calculate initial remaining amount for each person
  // remaining = total amount to pay - contribution already made
  const expenses = Array.from(personExpenses.values());

  // If receiptTotal > sum(items), treat the difference as tax/surcharge
  const itemsTotal = items.reduce((sum, it) => sum + it.price, 0);
  const surcharge =
    typeof receiptTotal === "number" && receiptTotal > itemsTotal
      ? receiptTotal - itemsTotal
      : 0;

  if (surcharge > 0) {
    // Distribute surcharge proportionally to each person's pre-tax total
    expenses.forEach((expense) => {
      const shareRatio = expense.total > 0 ? expense.total / itemsTotal : 0;
      const add = surcharge * shareRatio;
      expense.total += add;
    });
  }
  expenses.forEach((expense) => {
    expense.remaining = expense.total - (expense.contribution || 0);
  });

  // Redistribute excess contributions to people who still owe money
  // If someone overpaid, their excess is split equally among others who still owe
  const peopleWithExcess = expenses.filter((e) => (e.remaining || 0) < 0);
  const peopleWhoOwe = expenses.filter((e) => (e.remaining || 0) > 0);

  if (peopleWithExcess.length > 0 && peopleWhoOwe.length > 0) {
    // Calculate total excess to redistribute
    const totalExcess = peopleWithExcess.reduce(
      (sum, e) => sum + Math.abs(e.remaining || 0),
      0
    );

    // Split excess equally among people who still owe
    const excessPerPerson = totalExcess / peopleWhoOwe.length;

    // Apply excess to people who owe
    peopleWhoOwe.forEach((expense) => {
      expense.remaining = Math.max(
        0,
        (expense.remaining || 0) - excessPerPerson
      );
    });

    // Clear excess for people who overpaid (they've already contributed enough)
    peopleWithExcess.forEach((expense) => {
      expense.remaining = 0;
    });
  }

  // Return expenses for people who either have items or have contributed
  return expenses.filter((e) => e.total > 0 || (e.contribution || 0) > 0);
}
