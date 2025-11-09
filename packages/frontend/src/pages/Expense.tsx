import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { toast } from 'sonner'
import dayjs from 'dayjs'

interface Expense {
  expenseId: number
  description: string
  amount: number
  date: string
  category?: string
}

const Expense = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [form] = Form.useForm()

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const response = await api.get('/expense')
      setExpenses(response.data)
    } catch (error) {
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        date: values.date.toISOString(),
      }

      if (editingExpense) {
        await api.put(`/expense/${editingExpense.expenseId}`, data)
        toast.success('Expense updated successfully')
      } else {
        await api.post('/expense', data)
        toast.success('Expense added successfully')
      }

      setModalVisible(false)
      form.resetFields()
      setEditingExpense(null)
      fetchExpenses()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date),
    })
    setModalVisible(true)
  }

  const handleDelete = async (expenseId: number) => {
    try {
      await api.delete(`/expense/${expenseId}`)
      toast.success('Expense deleted successfully')
      fetchExpenses()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleAdd = () => {
    setEditingExpense(null)
    form.resetFields()
    setModalVisible(true)
  }

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || '-',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this expense?"
            onConfirm={() => handleDelete(record.expenseId)}
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
        <h1 className="text-2xl font-bold">Expense Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Expense
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={expenses}
        loading={loading}
        rowKey="expenseId"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingExpense(null)
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter expense description!' }]}
          >
            <Input placeholder="e.g., Groceries, Rent, etc." />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount!' }]}
          >
            <InputNumber
              prefix="RWF"
              placeholder="0.00"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Select placeholder="Select category" allowClear>
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
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingExpense ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setEditingExpense(null)
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

export default Expense
