import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Card, Popconfirm, Divider } from 'antd';
import axios from 'axios';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState(['admin', 'lecturer', 'student']);
  const [programs, setPrograms] = useState(['Computer Science', 'Engineering', 'Business', 'Medicine']);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/users');
      setUsers(response.data.users);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (currentUser) {
        // Update existing user
        await axios.put(`http://127.0.0.1:5000/api/users/${currentUser.id}`, values);
        message.success('User updated successfully');
      } else {
        // Create new user
        await axios.post('http://127.0.0.1:5000/api/register', values);
        message.success('User created successfully');
      }

      setVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/users/${id}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  // Open modal for editing or creating
  const showModal = (user = null) => {
    setCurrentUser(user);
    if (user) {
      form.setFieldsValue({
        ...user,
        ...(user.student_profile || {}),
        ...(user.lecturer_profile || {})
      });
    } else {
      form.resetFields();
    }
    setVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={
          role === 'admin' ? 'red' : 
          role === 'lecturer' ? 'blue' : 'green'
        }>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Lecturer', value: 'lecturer' },
        { text: 'Student', value: 'student' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        record.role === 'student' ? 
          `${record.student_profile?.program || 'N/A'} (Year ${record.student_profile?.year_of_study || 'N/A'})` :
          record.role === 'lecturer' ?
          record.lecturer_profile?.department || 'N/A' :
          'Admin User'
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      <Card
        title="All Users"
        extra={
          <Button type="primary" onClick={() => showModal()}>
            Add New User
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* User Modal */}
      <Modal
        title={currentUser ? 'Edit User' : 'Create User'}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please input a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          {!currentUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input the password!' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select onChange={() => form.setFieldsValue({ program: undefined, department: undefined })}>
              {roles.map(role => (
                <Option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Profile Information</Divider>

          <Form.Item noStyle shouldUpdate={(prev, current) => prev.role !== current.role}>
            {({ getFieldValue }) => (
              getFieldValue('role') === 'student' ? (
                <>
                  <Form.Item
                    name="reg_no"
                    label="Registration Number"
                    rules={[{ required: true, message: 'Please input registration number!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="program"
                    label="Program of Study"
                    rules={[{ required: true, message: 'Please select a program!' }]}
                  >
                    <Select>
                      {programs.map(program => (
                        <Option key={program} value={program}>{program}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="year_of_study"
                    label="Year of Study"
                    rules={[{ required: true, message: 'Please input year of study!' }]}
                  >
                    <Input type="number" min={1} max={6} />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please input phone number!' }]}
                  >
                    <Input />
                  </Form.Item>
                </>
              ) : getFieldValue('role') === 'lecturer' ? (
                <>
                  <Form.Item
                    name="staff_no"
                    label="Staff Number"
                    rules={[{ required: true, message: 'Please input staff number!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true, message: 'Please input department!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please input phone number!' }]}
                  >
                    <Input />
                  </Form.Item>
                </>
              ) : null
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;