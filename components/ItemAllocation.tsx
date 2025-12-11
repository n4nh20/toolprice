"use client";

// Component for allocating items to people
import type {
  ReceiptItem,
  Person,
  ItemAllocation as ItemAllocationType,
} from "@/types";

interface ItemAllocationProps {
  items: ReceiptItem[];
  people: Person[];
  allocations: ItemAllocationType[];
  onAllocationChange: (itemId: string, personIds: string[]) => void;
}

export default function ItemAllocation({
  items,
  people,
  allocations,
  onAllocationChange,
}: ItemAllocationProps) {
  const getPersonIdsForItem = (itemId: string): string[] => {
    const allocation = allocations.find((a) => a.itemId === itemId);
    return allocation?.personIds || [];
  };

  const togglePersonForItem = (itemId: string, personId: string) => {
    const currentPersonIds = getPersonIdsForItem(itemId);
    const newPersonIds = currentPersonIds.includes(personId)
      ? currentPersonIds.filter((id) => id !== personId)
      : [...currentPersonIds, personId];

    onAllocationChange(itemId, newPersonIds);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có món ăn nào. Hãy upload hoá đơn để bắt đầu.
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Vui lòng thêm ít nhất một người trước khi phân bổ món ăn.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Phân bổ món ăn</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const personIds = getPersonIdsForItem(item.id);

          return (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.price.toLocaleString("vi-VN")} VND
                    {item.quantity &&
                      item.quantity > 1 &&
                      ` × ${item.quantity}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allPersonIds = people.map((p) => p.id);
                    const currentPersonIds = getPersonIdsForItem(item.id);
                    // If all are selected, deselect all. Otherwise, select all.
                    if (currentPersonIds.length === allPersonIds.length) {
                      onAllocationChange(item.id, []);
                    } else {
                      onAllocationChange(item.id, allPersonIds);
                    }
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  {personIds.length === people.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {people.map((person) => {
                  const isSelected = personIds.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => togglePersonForItem(item.id, person.id)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        isSelected
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {person.name}
                    </button>
                  );
                })}
              </div>

              {personIds.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Chưa có ai được phân bổ món này
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
