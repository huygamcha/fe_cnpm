import React, { useCallback, useEffect, useState } from 'react';
import {
  Table,
  Button,
  Form,
  message,
  Alert,
  Popconfirm,
  Space,
  Modal,
  Pagination,
} from 'antd';
import numeral from 'numeral';
import 'numeral/locales/vi';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import axiosClient from '../../libraries/axiosClient';
import ProductForm from '../../components/ProductForm';
import Navigation from 'components/Navigation';

const MESSAGE_TYPE = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

numeral.locale('vi');

const DEFAULT_LIMIT = 5;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: DEFAULT_LIMIT,
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [refresh, setRefresh] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [updateForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const onShowMessage = useCallback(
    (content, type = MESSAGE_TYPE.SUCCESS) => {
      messageApi.open({
        type: type,
        content: content,
      });
    },
    [messageApi],
  );
  
  // hành động chỉnh sửa
  const onSelectProduct = useCallback(
    (data) => () => {
      setEditModalVisible(true);

      setSelectedProduct(data);

      updateForm.setFieldsValue(data);
    },
    [updateForm],
  );

  // xoá sản phẩm
  const onDeleteProduct = useCallback(
    (productId) => async () => {
      try {
        const response = await axiosClient.patch(`products/delete/${productId}`);

        onShowMessage(response.data.message);

        setRefresh((prevState) => prevState + 1);
      } catch (error) {
        console.log('««««« error »»»»»', error);
      }
    },
    [onShowMessage],
  );

  
  const onEditFinish = useCallback(
    async (values) => {
      try {
        const response = await axiosClient.put(
          `products/${selectedProduct._id}`,
          values,
        );

        updateForm.resetFields();

        setEditModalVisible(false);

        onShowMessage(response.data.message);

        const newList = products.map((item) => {
          if (item._id === selectedProduct._id) {
            return {
              ...item,
              ...values,
            };
          } 
          return item;
        })

        setProducts(newList);

        // setRefresh((prevState) => prevState + 1);
      } catch (error) {
        console.log('««««« error »»»»»', error);
      }
    },
    [onShowMessage, products, selectedProduct?._id, updateForm],
  );

  // lấy data để vào table
  const columns = [
    {
      title: 'No',
      dataIndex: 'No',
      key: 'no',
      width: '1%',
      render: function (text, record, index) {
        return <span>{(index + 1) + (pagination.pageSize * (pagination.page - 1))}</span>;
      },
    },
    {
      title: 'Tên SP',
      dataIndex: 'name',
      key: 'name',
      render: function (text, record) {
        return <Link to={`${record._id}`}>{text}</Link>;
      },
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplierName',
      filters: suppliers.map(supplier => ({
        text: supplier.name,
        value: supplier.name,
      })),
      onFilter: (value, record) => record.supplier.name.startsWith(value),
      filterSearch: true,
      render: function (text, record) {
        return (
          <div>
            {record.supplier?.name}
          </div>
          // <Link to={`suppliers/${record.supplier?._id}`}>
          //   {record.supplier?.name}
          // </Link>
        ); // record.supplier && record.supplier._id
      },
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'categoryName',
      filters: categories.map(category => ({
        text: category.name,
        value: category.name,
      })),
      onFilter: (value, record) => record.category.name.startsWith(value),
      filterSearch: true,
      render: function (text, record) {
        return (
          <div>
            {record.category.name}
          </div>
        );
      },
    },
    {
      title: 'Giá gốc',
      dataIndex: 'price',
      key: 'price',
      sorter: {
        compare: (a, b) => a.price - b.price,
        multiple: 1,
      },
      render: function (text) {
        return <strong>{numeral(text).format('0,0$')}</strong>;
      },
    },
    {
      title: 'Chiết khấu',
      dataIndex: 'discount',
      key: 'discount',
      sorter: {
        compare: (a, b) => a.discount - b.discount,
        multiple: 2,
      },
      render: function (text) {
        return <strong>{`${text}%`}</strong>;
      },
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: {
        compare: (a, b) => a.stock - b.stock,
        multiple: 3,
      },
      render: function (text) {
        return <strong>{numeral(text).format('0,0')}</strong>;
      },
    },
    {
      title: 'Giá bán',
      dataIndex: 'discountedPrice',
      key: 'discountedPrice',
      sorter: {
        compare: (a, b) => {
          const discountedPriceA = a.price * (100 - a.discount) / 100;
          const discountedPriceB = b.price * (100 - b.discount) / 100;
    
          return discountedPriceA - discountedPriceB;
        },
        multiple: 4,
      },
      render: function (text, record, index) {
        const discountedPrice = record.price * (100 - record.discount) / 100;
        return <strong>{numeral(discountedPrice).format('0,0$')}</strong>;
      },
    },
    {
      title: 'Mô tả',
      key: 'description',
      dataIndex: 'description',
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '1%',
      render: (text, record, index) => {
        return (
          <Space>
            <Button
              type="dashed"
              icon={<EditOutlined />}
              onClick={onSelectProduct(record)}
            />

            <Popconfirm
              title="Mày chắc muốn xóa không"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={onDeleteProduct(record._id)}
            >
              <Button danger type="dashed" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const getSuppliers = useCallback(async () => {
    try {
      const res = await axiosClient.get('/suppliers');
      setSuppliers(res.data.payload);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data.payload || []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/products?page=${pagination.page}&pageSize=${pagination.pageSize}`);
      setProducts(res.data.payload);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total,
      }))
    } catch (error) {
      console.log(error);
    }
  }, [pagination.page, pagination.pageSize]);

  const onChangePage = useCallback((page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      page,
      pageSize,
    }));

    getProducts();
  }, [getProducts]);

  useEffect(() => {
    getSuppliers();

    getCategories();
  }, [getCategories, getSuppliers]);

  useEffect(() => {
    getProducts();
  }, [getProducts, refresh]);

  return (
    <>
    <Navigation></Navigation>

    {/* hiện message */}
      {contextHolder}
      <Table
        rowKey="_id"
        pagination={false}
        dataSource={products}
        columns={columns}
      />

      <Pagination
        defaultCurrent={1}
        total={pagination.total}
        pageSize={DEFAULT_LIMIT}
        onChange={onChangePage}
        current={pagination.page}
      />

      <Modal
        open={editModalVisible}
        centered
        title="Cập nhật thông tin"
        onCancel={() => {
          setEditModalVisible(false);
        }}
        cancelText="Đóng"
        okText="Lưu"
        onOk={() => {
          updateForm.submit();
        }}
      >
        <ProductForm
          form={updateForm}
          suppliers={suppliers}
          categories={categories}
          onFinish={onEditFinish}
          formName="update-product"
          isHiddenSubmit
        />
      </Modal>
    </>
  );
}