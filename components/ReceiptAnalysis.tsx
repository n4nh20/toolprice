'use client';

// Component for displaying analyzed receipt items
import { ReceiptItem } from '@/types';

interface ReceiptAnalysisProps {
  items: ReceiptItem[];
  total: number;
  currency?: string;
  tax?: number;
  onTaxChange?: (tax: number) => void;
}

export default function ReceiptAnalysis({
  items,
  total,
  currency = 'VND',
  tax,
  onTaxChange,
}: ReceiptAnalysisProps) {
  if (items.length === 0) {
    return null;
  }

  const itemsTotal = items.reduce((sum, item) => sum + item.price, 0);
  const finalTotal = tax !== undefined && tax > 0 ? itemsTotal + tax : total;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Hoá đơn đã phân tích</h3>
      <div className="border border-gray-200 rounded-lg bg-white p-4">
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <p className="text-gray-900">{item.name}</p>
                {item.quantity && item.quantity > 1 && (
                  <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                )}
              </div>
              <p className="text-gray-900 font-medium">
                {item.price.toLocaleString('vi-VN')} {currency}
              </p>
            </div>
          ))}
        </div>
        
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tổng món ăn:</span>
            <span className="text-gray-900 font-medium">
              {itemsTotal.toLocaleString('vi-VN')} {currency}
            </span>
          </div>
          
          {onTaxChange && (
            <div className="flex justify-between items-center gap-2">
              <label className="text-gray-600 text-sm">Thuế/Phụ phí:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tax || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    onTaxChange(value === '' ? 0 : parseFloat(value) || 0);
                  }}
                  placeholder="0"
                  min="0"
                  step="1000"
                  className="w-32 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <span className="text-sm text-gray-600">{currency}</span>
              </div>
            </div>
          )}
          
          {tax !== undefined && tax > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Thuế/Phụ phí:</span>
              <span className="text-gray-900 font-medium">
                {tax.toLocaleString('vi-VN')} {currency}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="font-semibold text-gray-900">Tổng cộng:</span>
            <span className="text-lg font-bold text-gray-900">
              {finalTotal.toLocaleString('vi-VN')} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

