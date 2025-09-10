import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave, FiArrowLeft, FiX, FiPlus, FiGrid, FiMove, FiRepeat, FiSearch } from 'react-icons/fi';
import Api from '../../../Services/Api';

const AttributeFamilyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [groups, setGroups] = useState([
    { name: 'General', code: 'general', attributes: [], sortOrder: 0, isRepeatable: false }
  ]);
  const [unassignedAttributes, setUnassignedAttributes] = useState([]);
  const [draggingAttribute, setDraggingAttribute] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const [family, setFamily] = useState({
    name: '',
    code: '',
    status: 'active',
    isSystem: false
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        // First fetch all attributes
        const attributesResponse = await Api.get('/attributes');
        const attributesData = attributesResponse.data;
        setAttributes(attributesData);
        
        // If editing, fetch the family data after attributes are loaded
        if (id) {
          setIsEditing(true);
          await fetchAttributeFamily(attributesData);
        } else {
          // For new family, all attributes are unassigned
          setUnassignedAttributes(attributesData);
        }
      } catch (err) {
        toast.error('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [id]);

  const fetchAttributeFamily = async (attributesData) => {
    try {
      const response = await Api.get(`/attribute-families/${id}`);
      const familyData = response.data.data || response.data;
      
      // Set family data
      setFamily({
        name: familyData.name,
        code: familyData.code,
        status: familyData.status,
        isSystem: familyData.isSystem || false
      });

      // Process groups and attributes
      if (familyData.groups && familyData.attributes) {
        const updatedGroups = familyData.groups.map(group => ({
          ...group,
          attributes: [],
          isRepeatable: group.isRepeatable || false // Ensure isRepeatable is set
        }));

        // Get assigned attribute IDs for filtering unassigned attributes
        const assignedAttributeIds = [];
        
        // Map attributes to their groups
        familyData.attributes.forEach(attrData => {
          const attributeId = attrData.attribute._id || attrData.attribute;
          const groupIndex = updatedGroups.findIndex(g => g.code === attrData.group);
          
          if (groupIndex !== -1) {
            // Find the full attribute data from the pre-loaded attributes
            const fullAttribute = attributesData.find(a => a._id === attributeId);
            if (fullAttribute) {
              updatedGroups[groupIndex].attributes.push({
                ...fullAttribute,
                isRequired: attrData.isRequired || false,
                sortOrder: attrData.sortOrder || 0
              });
              assignedAttributeIds.push(attributeId);
            }
          }
        });

        setGroups(updatedGroups);
        
        // Set unassigned attributes (all attributes minus assigned ones)
        setUnassignedAttributes(attributesData.filter(attr => 
          !assignedAttributeIds.includes(attr._id)
        ));
      }
    } catch (err) {
      toast.error('Failed to load attribute family');
      console.error(err);
    }
  };

  const validate = () => {
    const errs = {};
    
    if (!family.name.trim()) errs.name = 'Family name is required';
    if (!family.code.trim()) errs.code = 'Family code is required';
    
    // Validate code format (lowercase, numbers, hyphens, underscores)
    const codeRegex = /^[a-z0-9_-]+$/;
    if (family.code && !codeRegex.test(family.code)) {
      errs.code = 'Code must contain only lowercase letters, numbers, hyphens and underscores';
    }
    
    // Check if at least one group has attributes
    const hasAttributes = groups.some(group => group.attributes.length > 0);
    if (!hasAttributes) {
      errs.groups = 'At least one attribute must be assigned';
    }
    
    // Validate group names and codes
    groups.forEach((group, index) => {
      if (!group.name.trim()) {
        errs[`group_${index}_name`] = `Group ${index + 1} name is required`;
      }
      if (!group.code.trim()) {
        errs[`group_${index}_code`] = `Group ${index + 1} code is required`;
      }
    });
    
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...family,
        groups: groups.map(group => ({
          name: group.name,
          code: group.code,
          sortOrder: group.sortOrder,
          isRepeatable: group.isRepeatable || false // Include isRepeatable in payload
        })),
        attributes: groups.flatMap(group => 
          group.attributes.map(attr => ({
            attribute: attr._id,
            sortOrder: attr.sortOrder || 0,
            isRequired: attr.isRequired || false,
            group: group.code
          }))
        )
      };
      
      if (isEditing) {
        await Api.put(`/attribute-families/${id}`, payload);
        toast.success('Attribute family updated successfully!');
      } else {
        await Api.post('/attribute-families', payload);
        toast.success('Attribute family created successfully!');
      }
      
      setTimeout(() => navigate('/attribute-families'), 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
        (isEditing ? 'Failed to update attribute family' : 'Failed to create attribute family');
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGroup = () => {
    const newGroup = {
      name: '',
      code: '',
      attributes: [],
      sortOrder: groups.length,
      isRepeatable: false
    };
    setGroups([...groups, newGroup]);
  };

  const handleRemoveGroup = (index) => {
    if (groups.length <= 1) {
      toast.error('Cannot remove the last group');
      return;
    }
    
    const groupToRemove = groups[index];
    const attrsToRemove = [...groupToRemove.attributes];
    
    setGroups(groups.filter((_, i) => i !== index));
    setUnassignedAttributes([...unassignedAttributes, ...attrsToRemove]);
  };

  const handleGroupChange = (index, field, value) => {
    const updatedGroups = [...groups];
    updatedGroups[index][field] = value;
    
    // If changing code, update attribute references
    if (field === 'code') {
      updatedGroups[index].attributes.forEach(attr => {
        attr.group = value;
      });
    }
    
    setGroups(updatedGroups);
  };

  const handleDragStart = (e, attribute, sourceGroupIndex) => {
    e.dataTransfer.setData('attributeId', attribute._id);
    e.dataTransfer.setData('sourceGroupIndex', sourceGroupIndex.toString());
    setDraggingAttribute(attribute);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetGroupIndex) => {
    e.preventDefault();
    const attributeId = e.dataTransfer.getData('attributeId');
    const sourceGroupIndex = parseInt(e.dataTransfer.getData('sourceGroupIndex'));
    
    const attribute = attributes.find(attr => attr._id === attributeId);
    if (!attribute) return;
    
    // Remove from source group
    const updatedGroups = [...groups];
    if (sourceGroupIndex >= 0) {
      updatedGroups[sourceGroupIndex].attributes = updatedGroups[sourceGroupIndex].attributes.filter(
        attr => attr._id !== attributeId
      );
    } else {
      // Remove from unassigned
      setUnassignedAttributes(unassignedAttributes.filter(attr => attr._id !== attributeId));
    }
    
    // Add to target group
    if (!updatedGroups[targetGroupIndex].attributes.find(attr => attr._id === attributeId)) {
      updatedGroups[targetGroupIndex].attributes.push({
        ...attribute,
        isRequired: false,
        sortOrder: updatedGroups[targetGroupIndex].attributes.length
      });
    }
    
    setGroups(updatedGroups);
    setDraggingAttribute(null);
  };

  const handleRemoveAttribute = (groupIndex, attributeId) => {
    const updatedGroups = [...groups];
    const attribute = updatedGroups[groupIndex].attributes.find(attr => attr._id === attributeId);
    
    updatedGroups[groupIndex].attributes = updatedGroups[groupIndex].attributes.filter(
      attr => attr._id !== attributeId
    );
    
    setGroups(updatedGroups);
    setUnassignedAttributes([...unassignedAttributes, attribute]);
  };

  const handleAttributeSettingChange = (groupIndex, attributeIndex, field, value) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].attributes[attributeIndex][field] = value;
    setGroups(updatedGroups);
  };

  const handleAddAttributeToGroup = (groupIndex, attribute) => {
    const updatedGroups = [...groups];
    
    // Check if attribute is already in this group
    const isAlreadyInGroup = updatedGroups[groupIndex].attributes.some(
      attr => attr._id === attribute._id
    );
    
    if (!isAlreadyInGroup) {
      updatedGroups[groupIndex].attributes.push({
        ...attribute,
        isRequired: false,
        sortOrder: updatedGroups[groupIndex].attributes.length
      });
      
      setGroups(updatedGroups);
      
      // Remove from unassigned if it was there
      setUnassignedAttributes(unassignedAttributes.filter(attr => attr._id !== attribute._id));
      
      toast.success(`Added ${attribute.label} to ${updatedGroups[groupIndex].name}`);
    } else {
      toast.info(`Attribute ${attribute.label} is already in this group`);
    }
  };

  // Get all assigned attribute IDs
  const assignedAttributeIds = new Set();
  groups.forEach(group => {
    group.attributes.forEach(attr => {
      assignedAttributeIds.add(attr._id);
    });
  });

  // Filter attributes based on search term
  const filteredAttributes = attributes.filter(attr => 
    attr.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    attr.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Edit Attribute Family' : 'Create Attribute Family'}
          </h2>
          <button
            className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded text-sm transition-all"
            onClick={() => navigate('/attribute-families')}
          >
            <FiArrowLeft className="text-sm" /> Back
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-xs">
              <h3 className="text-md font-semibold text-purple-800 border-b border-purple-200 pb-2 mb-3">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Family Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={family.name}
                    onChange={(e) => setFamily({ ...family, name: e.target.value })}
                    placeholder="Enter family name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Family Code *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={family.code}
                    onChange={(e) => setFamily({ ...family, code: e.target.value })}
                    placeholder="Enter unique code"
                    disabled={isEditing && family.isSystem}
                  />
                  {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Use lowercase letters, numbers, hyphens, or underscores only
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    value={family.status}
                    onChange={(e) => setFamily({ ...family, status: e.target.value })}
                    disabled={isEditing && family.isSystem}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {isEditing && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">System Family</label>
                    <div className="px-3 py-1.5 bg-gray-100 rounded text-sm">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        family.isSystem 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {family.isSystem ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attribute Groups and Available Attributes Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Attribute Groups - 3/4 width */}
              <div className="lg:col-span-3 bg-white p-4 rounded-lg border border-purple-100 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-semibold text-purple-800">Attribute Groups</h3>
                  {!(isEditing && family.isSystem) && (
                    <button
                      type="button"
                      className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-purple-200"
                      onClick={handleAddGroup}
                    >
                      <FiPlus size={14} /> Add Group
                    </button>
                  )}
                </div>

                {errors.groups && (
                  <p className="text-xs text-red-600 mb-3">{errors.groups}</p>
                )}

                <div className="space-y-3">
                  {groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-purple-700 text-sm">Group {groupIndex + 1}</h4>
                        {!(isEditing && family.isSystem) && groups.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 text-sm"
                            onClick={() => handleRemoveGroup(groupIndex)}
                          >
                            <FiX size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Group Name *</label>
                          <input
                            type="text"
                            className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                              errors[`group_${groupIndex}_name`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            value={group.name}
                            onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)}
                            placeholder="Enter group name"
                            disabled={isEditing && family.isSystem}
                          />
                          {errors[`group_${groupIndex}_name`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`group_${groupIndex}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Group Code *</label>
                          <input
                            type="text"
                            className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                              errors[`group_${groupIndex}_code`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            value={group.code}
                            onChange={(e) => handleGroupChange(groupIndex, 'code', e.target.value)}
                            placeholder="Enter group code"
                            disabled={isEditing && family.isSystem}
                          />
                          {errors[`group_${groupIndex}_code`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`group_${groupIndex}_code`]}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-end md:justify-start mt-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`repeatable-${groupIndex}`}
                              className="h-3.5 w-3.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              checked={group.isRepeatable}
                              onChange={(e) => handleGroupChange(groupIndex, 'isRepeatable', e.target.checked)}
                              disabled={isEditing && family.isSystem}
                            />
                            <label htmlFor={`repeatable-${groupIndex}`} className="ml-1.5 text-xs text-gray-700 flex items-center">
                              <FiRepeat className="mr-0.5" size={12} /> Repeatable
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Attributes */}
                      {!(isEditing && family.isSystem) && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs text-gray-600">Quick Add Attributes</label>
                            <button
                              type="button"
                              className="text-purple-600 text-xs flex items-center"
                              onClick={() => {
                                setShowAllAttributes(!showAllAttributes);
                                setActiveGroupIndex(groupIndex);
                              }}
                            >
                              {showAllAttributes && activeGroupIndex === groupIndex ? 'Hide Attributes' : 'Show Attributes'}
                            </button>
                          </div>
                          
                          {showAllAttributes && activeGroupIndex === groupIndex && (
                            <div className="bg-white border border-gray-200 rounded p-2 mb-2">
                              <div className="relative mb-1">
                                <FiSearch className="absolute left-2 top-1.5 text-gray-400" size={14} />
                                <input
                                  type="text"
                                  className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded"
                                  placeholder="Search attributes..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                              </div>
                              
                              <div className="max-h-32 overflow-y-auto">
                                {filteredAttributes.map(attribute => {
                                  const isAssigned = group.attributes.some(attr => attr._id === attribute._id);
                                  
                                  return (
                                    <div
                                      key={attribute._id}
                                      className={`p-1 flex justify-between items-center rounded text-xs ${
                                        isAssigned 
                                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                          : 'hover:bg-purple-50 cursor-pointer'
                                      }`}
                                      onClick={() => !isAssigned && handleAddAttributeToGroup(groupIndex, attribute)}
                                    >
                                      <div className="truncate">
                                        <div className="font-medium truncate">{attribute.label}</div>
                                        <div className="text-gray-500 truncate">{attribute.code}</div>
                                      </div>
                                      {isAssigned ? (
                                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                          Added
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded hover:bg-purple-200 whitespace-nowrap"
                                          onClick={() => handleAddAttributeToGroup(groupIndex, attribute)}
                                        >
                                          Add
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                                
                                {filteredAttributes.length === 0 && (
                                  <div className="text-center py-1 text-gray-500 text-xs">
                                    No attributes found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Group Drop Zone */}
                      <div
                        className="min-h-20 border border-dashed border-purple-300 rounded p-3 mb-3 bg-white"
                        onDragOver={handleDragOver}
                        onDrop={(e) => !(isEditing && family.isSystem) && handleDrop(e, groupIndex)}
                      >
                        <p className="text-center text-purple-500 text-xs mb-1">
                          {isEditing && family.isSystem ? 'System family attributes cannot be modified' : 'Drop attributes here or use quick add'}
                        </p>
                        
                        {group.attributes.length === 0 ? (
                          <div className="text-center py-4">
                            <FiGrid className="mx-auto text-gray-400 text-lg mb-1" />
                            <p className="text-gray-500 text-xs">No attributes assigned</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {group.attributes.map((attribute, attrIndex) => (
                              <div
                                key={attribute._id}
                                className="flex items-center justify-between p-2 border border-gray-200 rounded bg-white text-xs"
                                draggable={!(isEditing && family.isSystem)}
                                onDragStart={(e) => !(isEditing && family.isSystem) && handleDragStart(e, attribute, groupIndex)}
                              >
                                <div className="flex items-center gap-2">
                                  {!(isEditing && family.isSystem) && <FiMove className="text-gray-400 cursor-move" size={12} />}
                                  <span className="font-medium truncate">{attribute.label}</span>
                                  <span className="text-gray-500">({attribute.code})</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center text-gray-600">
                                    <input
                                      type="checkbox"
                                      className="mr-0.5"
                                      checked={attribute.isRequired}
                                      onChange={(e) => handleAttributeSettingChange(
                                        groupIndex,
                                        attrIndex,
                                        'isRequired',
                                        e.target.checked
                                      )}
                                      disabled={isEditing && family.isSystem}
                                    />
                                    Required
                                  </label>
                                  
                                  {!(isEditing && family.isSystem) && (
                                    <button
                                      type="button"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => handleRemoveAttribute(groupIndex, attribute._id)}
                                    >
                                      <FiX size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Attributes - 1/4 width */}
              {!(isEditing && family.isSystem) && (
                <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-xs h-fit">
                  <h3 className="text-md font-semibold text-purple-800 border-b border-purple-200 pb-2 mb-3">
                    Available Attributes
                  </h3>
                  
                  <div className="relative mb-3">
                    <FiSearch className="absolute left-2 top-1.5 text-gray-400" size={14} />
                    <input
                      type="text"
                      className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Search attributes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {unassignedAttributes.map(attribute => (
                      <div
                        key={attribute._id}
                        className="p-2 border border-gray-200 rounded bg-white cursor-move hover:shadow-xs text-xs"
                        draggable
                        onDragStart={(e) => handleDragStart(e, attribute, -1)}
                      >
                        <div className="font-medium truncate">{attribute.label}</div>
                        <div className="text-gray-500 truncate">{attribute.code}</div>
                        <div className="text-purple-600 truncate text-xs">{attribute.type}</div>
                      </div>
                    ))}
                    
                    {unassignedAttributes.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        All attributes have been assigned to groups
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Section */}
            <div className="flex justify-end gap-3 pt-3 border-t border-purple-200">
              <button
                type="button"
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm flex items-center gap-1 hover:bg-gray-300"
                onClick={() => navigate('/attribute-families')}
                disabled={isSubmitting}
              >
                <FiArrowLeft size={14} /> Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded text-sm flex items-center gap-1 hover:from-purple-700 hover:to-indigo-800"
                disabled={isSubmitting || (isEditing && family.isSystem)}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FiSave size={14} /> {isEditing ? 'Update' : 'Create'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttributeFamilyForm;