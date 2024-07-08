import React, { useState, useEffect } from "react";
import axios from "axios";

const FormEntry = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    KD_BARANG: "",
    QTY: "",
    HARGA: "",
    DISC: 0,
  });
  const [transaction, setTransaction] = useState({
    kodeTransaksi: "",
    totalItem: 0,
    discount: 0,
    totalHarga: 0,
    tglTransaksi: new Date().toISOString().slice(0, 10),
    kodeSupplier: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    const fetchNextKodeTransaksi = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/nextId");
        setTransaction((prevTransaction) => ({
          ...prevTransaction,
          kodeTransaksi: response.data.newCode,
        }));
      } catch (error) {
        console.error("Error fetching next transaction code:", error);
      }
    };

    fetchNextKodeTransaksi();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransaction({ ...transaction, [name]: value });
  };

  const handleAddRow = () => {
    const updatedItems = [...items, { ...newItem }];
    setItems(updatedItems);
    setNewItem({
      KD_BARANG: "",
      QTY: "",
      HARGA: "",
      DISC: 0,
    });

    calculateTotals(updatedItems);
  };

  const handleRemoveRow = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleEditRow = (index) => {
    setEditingIndex(index);
    const itemToEdit = items[index];
    setNewItem({
      KD_BARANG: itemToEdit.KD_BARANG,
      QTY: itemToEdit.QTY,
      HARGA: itemToEdit.HARGA,
      DISC: itemToEdit.DISC,
    });
  };

  const calculateTotals = (items) => {
    const totalItem = items.length;
    const totalHarga = items.reduce((sum, item) => {
      const harga = parseFloat(item.HARGA) || 0;
      return sum + harga;
    }, 0);

    setTransaction({
      ...transaction,
      totalItem,
      totalHarga,
    });
  };

  const handleSubmit = async () => {
    try {
      // Update existing data
      await axios.put("http://localhost:3000/api/po", transaction);

      // Submit new items
      await axios.post("http://localhost:3000/api/podetail", items);

      alert("Data berhasil disimpan!");
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleCancel = () => {
    setNewItem({
      KD_BARANG: "",
      QTY: "",
      HARGA: "",
      DISC: "",
    });
    setItems([]);
    setTransaction({
      totalItem: 0,
      discount: 0,
      totalHarga: 0,
      tglTransaksi: new Date().toISOString().slice(0, 10),
      kodeSupplier: "",
    });
  };

  const handlePrintPO = () => {
    // Implement print logic or redirect to print preview page
    window.print();
  };

  return (
    <div style={{ width: "75%", margin: "auto" }}>
      <h1>Pemasukan Data PO</h1>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "8px" }}>
        <div style={{ display: "flex" }}>
          <div>
            Kode Transaksi
            <input disabled value={transaction.kodeTransaksi} />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div>
            Total Item Barang
            <input disabled value={transaction.totalItem} />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div>
            Discount
            <input disabled value={transaction.discount} />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div>
            TGL TRANS
            <input type="date" name="tglTransaksi" value={transaction.tglTransaksi} onChange={handleTransactionChange} />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div>
            Total Harga
            <input disabled value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(transaction.totalHarga)} />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div>
            Kode supplier
            <input
              type="text"
              name="kodeSupplier"
              value={transaction.kodeSupplier}
              onChange={handleTransactionChange}
              onBlur={async () => {
                try {
                  const response = await axios.get(`http://localhost:3000/api/supplier/${transaction.kodeSupplier}`);
                  if (!response.data) {
                    alert("Kode Supplier tidak ada");
                  }
                } catch (error) {
                  console.error("Error checking supplier code:", error);
                }
              }}
            />
          </div>
        </div>
      </div>
      <table border={1} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>No</th>
            <th>Kode</th>
            <th>Nama Barang</th>
            <th>QTY</th>
            <th>Harga</th>
            <th>Disc (%)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.KD_BARANG}>
              <td>{index + 1}</td>
              <td>
                {editingIndex === index ? (
                  <input
                    type="text"
                    name="KD_BARANG"
                    value={item.KD_BARANG}
                    onChange={(e) => {
                      const updatedItem = { ...item, KD_BARANG: e.target.value };
                      setItems(items.map((itm, i) => (i === index ? updatedItem : itm)));
                    }}
                  />
                ) : (
                  item.KD_BARANG
                )}
              </td>
              <td>{editingIndex === index ? <input type="text" name="NAMA_BRG" value={item.NAMA_BRG} disabled /> : item.NAMA_BRG}</td>
              <td>
                {editingIndex === index ? (
                  <input
                    type="number"
                    name="QTY"
                    value={item.QTY}
                    onChange={(e) => {
                      const updatedItem = { ...item, QTY: e.target.value };
                      setItems(items.map((itm, i) => (i === index ? updatedItem : itm)));
                    }}
                  />
                ) : (
                  item.QTY
                )}
              </td>
              <td>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.HARGA)}</td>
              <td>
                {editingIndex === index ? (
                  <input
                    type="number"
                    name="DISC"
                    value={item.DISC}
                    onChange={(e) => {
                      const updatedItem = { ...item, DISC: e.target.value };
                      setItems(items.map((itm, i) => (i === index ? updatedItem : itm)));
                    }}
                  />
                ) : (
                  item.DISC
                )}
              </td>
              <td>
                {editingIndex === index ? <button onClick={() => setEditingIndex(null)}>Save</button> : <button onClick={() => handleEditRow(index)}>Edit</button>}
                <button onClick={() => handleRemoveRow(index)}>Delete</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>{items.length + 1}</td>
            <td>
              <input type="text" name="KD_BARANG" value={newItem.KD_BARANG} onChange={handleInputChange} />
            </td>
            <td>
              <input type="text" name="NAMA_BRG" value={newItem.NAMA_BRG} onChange={handleInputChange} />
            </td>
            <td>
              <input type="number" name="QTY" value={newItem.QTY} onChange={handleInputChange} />
            </td>
            <td>
              <input type="number" name="HARGA" value={newItem.HARGA} onChange={handleInputChange} />
            </td>
            <td>
              <input type="number" name="DISC" value={newItem.DISC} onChange={handleInputChange} />
            </td>
            <td></td>
          </tr>
          <tr>
            <td colSpan="7">
              <button onClick={handleAddRow}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handlePrintPO}>CETAK PO</button>
      </div>
    </div>
  );
};

export default FormEntry;
