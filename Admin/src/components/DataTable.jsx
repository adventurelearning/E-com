import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const DataTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  showActions = true
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => onToggleStatus(item._id)}
                      className={item.isActive 
                        ? "text-yellow-600 hover:text-yellow-900" 
                        : "text-green-600 hover:text-green-900"}
                    >
                      {item.isActive 
                        ? <FiToggleLeft size={18} /> 
                        : <FiToggleRight size={18} />}
                    </button>
                    <button
                      onClick={() => onDelete(item._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;