'use client';

// Component for managing list of people
import { Person } from '@/types';
import { useState } from 'react';

interface PeopleManagerProps {
  people: Person[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
  onUpdateContribution: (id: string, amount: number) => void;
}

export default function PeopleManager({
  people,
  onAddPerson,
  onRemovePerson,
  onUpdateContribution,
}: PeopleManagerProps) {
  const [newPersonName, setNewPersonName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      setNewPersonName('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Danh sách người</h3>
      
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Tên người"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Thêm
        </button>
      </form>

      <div className="space-y-2">
        {people.map((person) => (
          <div
            key={person.id}
            className="p-3 bg-gray-50 rounded-md space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">{person.name}</span>
              <button
                onClick={() => onRemovePerson(person.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Xóa
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                Đã góp:
              </label>
              <input
                type="number"
                value={person.contribution || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdateContribution(
                    person.id,
                    value === '' ? 0 : parseFloat(value) || 0
                  );
                }}
                placeholder="0"
                min="0"
                step="1000"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-600">VND</span>
            </div>
          </div>
        ))}
        {people.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Chưa có người nào. Thêm người để bắt đầu chia tiền.
          </p>
        )}
      </div>
    </div>
  );
}

