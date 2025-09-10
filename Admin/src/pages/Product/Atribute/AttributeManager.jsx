import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, 
  Switch, Space, message, Card, Row, Col,
  InputNumber, Divider, Tag, Collapse
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CloseOutlined, SaveOutlined 
} from '@ant-design/icons';
import Api from '../../../Services/Api';

const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const AttributeManager = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [form] = Form.useForm();

  const attributeTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'price', label: 'Price' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'select', label: 'Select' },
    { value: 'multiselect', label: 'Multi-Select' },
    { value: 'datetime', label: 'Date Time' },
    { value: 'date', label: 'Date' },
    { value: 'image', label: 'Image' },
    // { value: 'file', label: 'File' },
    { value: 'color', label: 'Color' },
    { value: 'MCE Editer', label: 'MCE Editer' },
    { value: 'keyvalue', label: 'Key-Value' }
  ];

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const { data } = await Api.get('/attributes');
      setAttributes(data);
    } catch (error) {
      message.error('Failed to fetch attributes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Process options if present
      if (values.options && Array.isArray(values.options)) {
        values.options = values.options.map((opt, index) => ({
          ...opt,
          sortOrder: index
        }));
      }

      // For keyvalue type, we don't need to process keyValuePairs here
      // They will be added at the product level

      if (editingAttribute) {
        await Api.put(`/attributes/${editingAttribute._id}`, values);
        message.success('Attribute updated successfully');
      } else {
        await Api.post('/attributes', values);
        message.success('Attribute created successfully');
      }

      setModalVisible(false);
      setEditingAttribute(null);
      form.resetFields();
      fetchAttributes();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    
    // Prepare options for form if they exist
    const formValues = { ...attribute };
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this attribute? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await Api.delete(`/attributes/${id}`);
          message.success('Attribute deleted successfully');
          fetchAttributes();
        } catch (error) {
          message.error(error.response?.data?.message || 'Delete failed');
        }
      }
    });
  };

  const renderOptionsField = (type) => {
    if (type !== 'select' && type !== 'multiselect') return null;

    return (
      <Card 
        title="Options" 
        size="small" 
        style={{ marginBottom: 16 }}
      >
        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8, alignItems: 'center' }}>
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, 'value']}
                      rules={[{ required: true, message: 'Option value is required' }]}
                    >
                      <Input placeholder="Value (e.g., 'red')" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, 'label']}
                      rules={[{ required: true, message: 'Option label is required' }]}
                    >
                      <Input placeholder="Label (e.g., 'Red')" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Button
                      type="text"
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Col>
                </Row>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Add Option
              </Button>
            </>
          )}
        </Form.List>
      </Card>
    );
  };

  const renderKeyValueInfo = (type) => {
    if (type !== 'keyvalue') return null;

    return (
      <Card 
        title="Key-Value Attribute Information" 
        size="small" 
        style={{ marginBottom: 16, backgroundColor: '#f0f5ff' }}
      >
        <p style={{ margin: 0 }}>
          <strong>Note:</strong> For Key-Value attributes, the actual key-value pairs will be added at the product level, not here.
          This attribute type allows products to have custom key-value data.
        </p>
      </Card>
    );
  };

  const renderValidationFields = () => (
    <Collapse ghost>
      <Panel header="Validation Rules" key="1">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Min Length"
              name={['validation', 'minLength']}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Max Length"
              name={['validation', 'maxLength']}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Required"
              name={['validation', 'isRequired']}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Regular Expression"
          name={['validation', 'regex']}
        >
          <Input placeholder="/^[A-Z]+$/i" />
        </Form.Item>
      </Panel>
    </Collapse>
  );

  const renderConfigurationFields = () => (
    <Collapse ghost>
      <Panel header="Configuration" key="1">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Filterable"
              name={['configuration', 'isFilterable']}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Comparable"
              name={['configuration', 'isComparable']}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Visible"
              name={['configuration', 'isVisible']}
              valuePropName="checked"
            >
              <Switch defaultChecked />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Searchable"
              name={['configuration', 'isSearchable']}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Sort Order"
          name={['configuration', 'sortOrder']}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Panel>
    </Collapse>
  );

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'select' || type === 'multiselect' ? 'green' : 
                   type === 'keyvalue' ? 'purple' : 'geekblue'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Key-Value Info',
      dataIndex: 'type',
      key: 'keyValueInfo',
      render: (type) => (
        type === 'keyvalue' ? (
          <Tag color="purple">Defined at product level</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        )
      )
    },
    {
      title: 'Required',
      dataIndex: ['validation', 'isRequired'],
      key: 'isRequired',
      render: (value) => (
        <Tag color={value ? 'red' : 'default'}>
          {value ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      title: 'Filterable',
      dataIndex: ['configuration', 'isFilterable'],
      key: 'isFilterable',
      render: (value) => (
        <Tag color={value ? 'green' : 'default'}>
          {value ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            size="small"
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card 
        title="Attribute Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Create Attribute
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={attributes} 
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingAttribute ? 'Edit Attribute' : 'Create New Attribute'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAttribute(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            configuration: {
              isVisible: true,
              sortOrder: 0
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Attribute Code"
                name="code"
                rules={[
                  { required: true, message: 'Please enter attribute code' },
                  { 
                    pattern: /^[A-Z0-9_]+$/, 
                    message: 'Code must contain only uppercase letters, numbers and underscores' 
                  }
                ]}
                tooltip="Unique identifier for the attribute (e.g., COLOR, SIZE, MATERIAL)"
              >
                <Input 
                  placeholder="e.g., COLOR, SIZE, MATERIAL" 
                  disabled={!!editingAttribute}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Attribute Label"
                name="label"
                rules={[{ required: true, message: 'Please enter attribute label' }]}
                tooltip="User-friendly name for the attribute"
              >
                <Input placeholder="e.g., Color, Size, Material" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Attribute Type"
            name="type"
            rules={[{ required: true, message: 'Please select attribute type' }]}
          >
            <Select placeholder="Select attribute type">
              {attributeTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
            {() => {
              const type = form.getFieldValue('type');
              return (
                <>
                  {renderOptionsField(type)}
                  {renderKeyValueInfo(type)}
                </>
              );
            }}
          </Form.Item>

          <Divider />

          {renderValidationFields()}
          {renderConfigurationFields()}

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              style={{ marginRight: 8 }}
            >
              {editingAttribute ? 'Update Attribute' : 'Create Attribute'}
            </Button>
            <Button 
              onClick={() => {
                setModalVisible(false);
                setEditingAttribute(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributeManager;