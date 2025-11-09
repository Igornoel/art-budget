import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, Select, Space, Popconfirm, Progress, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { toast } from 'sonner'

interface Budget {
  budgetId: number
  category: string
  plannedAmount: number
  actualAmount: number
  period: string
}

const Budget = () => {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [form] = Form.useForm()

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const response = await api.get('/budget')
      setBudgets(response.data)
    } catch (error) {
      toast.error('Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      if (editingBudget) {
        await api.put(`/budget/${editingBudget.budgetId}`, values)
        toast.success('Budget updated successfully')
      } else {
        await api.post('/budget', values)
        toast.success('Budget created successfully')
      }

      setModalVisible(false)
      form.resetFields()
      setEditingBudget(null)
      fetchBudgets()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    form.setFieldsValue(budget)
    setModalVisible(true)
  }

  const handleDelete = async (budgetId: number) => {
    try {
      await api.delete(`/budget/${budgetId}`)
      toast.success('Budget deleted successfully')
      fetchBudgets()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleAdd = () => {
    setEditingBudget(null)
    form.resetFields()
    setModalVisible(true)
  }

  const formatCurrency = (amount: number) => {
    return `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Planned Amount',
      dataIndex: 'plannedAmount',
      key: 'plannedAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Actual Amount',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, record: Budget) => {
        const percentage = (Number(record.actualAmount) / Number(record.plannedAmount)) * 100
        const status = percentage > 100 ? 'exception' : percentage > 80 ? 'active' : 'success'
        return (
          <Progress
            percent={Math.min(percentage, 100)}
            status={percentage > 100 ? 'exception' : status}
            format={() => `${percentage.toFixed(1)}%`}
          />
        )
      },
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period: string) => (
        <Tag color={period === 'yearly' ? 'blue' : period === 'monthly' ? 'green' : 'orange'}>
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Budget) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this budget?"
            onConfirm={() => handleDelete(record.budgetId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Budget Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Create Budget
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={budgets}
        loading={loading}
        rowKey="budgetId"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingBudget(null)
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="Food">Food</Select.Option>
              <Select.Option value="Transport">Transport</Select.Option>
              <Select.Option value="Shopping">Shopping</Select.Option>
              <Select.Option value="Bills">Bills</Select.Option>
              <Select.Option value="Entertainment">Entertainment</Select.Option>
              <Select.Option value="Health">Health</Select.Option>
              <Select.Option value="Education">Education</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="plannedAmount"
            label="Planned Amount"
            rules={[{ required: true, message: 'Please enter planned amount!' }]}
          >
            <InputNumber
              prefix="RWF"
              placeholder="0.00"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="period"
            label="Period"
            rules={[{ required: true, message: 'Please select period!' }]}
          >
            <Select placeholder="Select period">
              <Select.Option value="weekly">Weekly</Select.Option>
              <Select.Option value="monthly">Monthly</Select.Option>
              <Select.Option value="yearly">Yearly</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBudget ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setEditingBudget(null)
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Budget
