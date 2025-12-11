"use client";

// Main page for expense splitting tool
import { useState } from "react";
import ReceiptUpload from "@/components/ReceiptUpload";
import ReceiptAnalysis from "@/components/ReceiptAnalysis";
import PeopleManager from "@/components/PeopleManager";
import ItemAllocation from "@/components/ItemAllocation";
import ExpenseSummary from "@/components/ExpenseSummary";
import {
  Person,
  ItemAllocation as ItemAllocationType,
  ReceiptAnalysis as ReceiptAnalysisType,
  PersonExpense,
} from "@/types";
import { calculateExpenses } from "@/lib/calculations";

export default function Home() {
  const [receiptData, setReceiptData] = useState<ReceiptAnalysisType | null>(
    null
  );
  const [people, setPeople] = useState<Person[]>([]);
  const [allocations, setAllocations] = useState<ItemAllocationType[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tax, setTax] = useState<number>(0);

  // Handle file upload and analysis
  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze-receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Read response as text first (can only read once)
        const text = await response.text();
        console.error("[FE] API error response:", {
          status: response.status,
          statusText: response.statusText,
          text: text.substring(0, 200),
        });

        let errorMessage = "Failed to analyze receipt";

        // Try to parse as JSON, but handle text responses too
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If response is not JSON (e.g., "Forbidden"), clean up the message
          if (text.includes("Forbidden")) {
            // This might be from Vercel Edge/Blob, provide a clearer message
            errorMessage = `Server returned ${response.status} Forbidden. Please check if GEMINI_API_KEY is configured correctly on Vercel.`;
          } else {
            errorMessage =
              text ||
              `Server returned ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data: ReceiptAnalysisType = await response.json();
      setReceiptData(data);
      // Reset allocations when new receipt is analyzed
      setAllocations([]);
      // Calculate tax/surcharge if total > sum of items
      const itemsTotal = data.items.reduce((sum, item) => sum + item.price, 0);
      const calculatedTax =
        data.total > itemsTotal ? data.total - itemsTotal : 0;
      setTax(calculatedTax);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi phân tích hoá đơn"
      );
      console.error("Error analyzing receipt:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Manage people
  const handleAddPerson = (name: string) => {
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name,
    };
    setPeople([...people, newPerson]);
  };

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter((p) => p.id !== id));
    // Remove allocations for this person
    setAllocations(
      allocations
        .map((alloc) => ({
          ...alloc,
          personIds: alloc.personIds.filter((pid) => pid !== id),
        }))
        .filter((alloc) => alloc.personIds.length > 0)
    );
  };

  // Handle contribution update
  const handleUpdateContribution = (id: string, amount: number) => {
    setPeople(
      people.map((p) => (p.id === id ? { ...p, contribution: amount } : p))
    );
  };

  // Handle item allocation
  const handleAllocationChange = (itemId: string, personIds: string[]) => {
    setAllocations((prev) => {
      const filtered = prev.filter((a) => a.itemId !== itemId);
      if (personIds.length > 0) {
        return [...filtered, { itemId, personIds }];
      }
      return filtered;
    });
  };

  // Calculate expenses with tax
  const itemsTotal = receiptData
    ? receiptData.items.reduce((sum, item) => sum + item.price, 0)
    : 0;
  const finalTotal = itemsTotal + tax;

  const expenses: PersonExpense[] = receiptData
    ? calculateExpenses(receiptData.items, people, allocations, finalTotal)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tool Chia Tiền
          </h1>
          <p className="text-gray-600">
            Upload hoá đơn, AI sẽ phân tích và giúp bạn chia tiền công bằng
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ReceiptUpload
            onUpload={handleFileUpload}
            isAnalyzing={isAnalyzing}
          />
          {isAnalyzing && (
            <div className="mt-4 text-center text-gray-600">
              <p>Đang phân tích hoá đơn...</p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Receipt Analysis */}
        {receiptData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ReceiptAnalysis
              items={receiptData.items}
              total={receiptData.total}
              currency={receiptData.currency}
              tax={tax}
              onTaxChange={setTax}
            />
          </div>
        )}

        {/* People Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PeopleManager
            people={people}
            onAddPerson={handleAddPerson}
            onRemovePerson={handleRemovePerson}
            onUpdateContribution={handleUpdateContribution}
          />
        </div>

        {/* Item Allocation */}
        {receiptData && people.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ItemAllocation
              items={receiptData.items}
              people={people}
              allocations={allocations}
              onAllocationChange={handleAllocationChange}
            />
          </div>
        )}

        {/* Expense Summary */}
        {expenses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ExpenseSummary
              expenses={expenses}
              receiptTotal={finalTotal}
              items={receiptData?.items}
              allocations={allocations}
            />
          </div>
        )}
      </div>
    </div>
  );
}
