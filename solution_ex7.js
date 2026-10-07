
const DeviceModule = (() => {

  let idCounter = 0;

 


  const generateId = () => {
    idCounter++;
    let numberText = String(idCounter);
    while (numberText.length < 3) {
      numberText = "0" + numberText;
    }
    return "DEV_" + numberText;
  };

  
  const findIndexById = (list, id) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return i;
    }
    return -1;
  };

  
  const validateDevice = (dev) => {
    if (dev === null || typeof dev !== "object") {
      return { valid: false, message: "Dữ liệu thiết bị không hợp lệ" };
    }
    if (typeof dev.name !== "string" || dev.name.trim() === "") {
      return { valid: false, message: "Tên thiết bị là bắt buộc" };
    }
    if (typeof dev.room !== "string" || dev.room.trim() === "") {
      return { valid: false, message: "Phòng là bắt buộc" };
    }
    if (typeof dev.powerWatts !== "number" || isNaN(dev.powerWatts) || dev.powerWatts <= 0) {
      return { valid: false, message: "Công suất phải là số lớn hơn 0" };
    }
    return { valid: true };
  };

 
  const createDevice = (list, newDev) => {
    const check = validateDevice(newDev);
    if (!check.valid) {
      console.log("  [createDevice] Thất bại: " + check.message);
      return null;
    }

    const device = {
      id: generateId(),
      name: newDev.name.trim(),
      room: newDev.room.trim(),
      powerWatts: newDev.powerWatts,
    
      isActive: typeof newDev.isActive === "boolean" ? newDev.isActive : false,
    };
    list.push(device);
    return device;
  };

  // READ: lọc thiết bị theo phòng (không phân biệt hoa/thường)
  const readDevicesByRoom = (list, roomName) => {
    const result = [];
    if (typeof roomName !== "string") return result;

    const target = roomName.trim().toLowerCase();
    for (let i = 0; i < list.length; i++) {
      if (list[i].room.toLowerCase() === target) {
        result.push(list[i]);
      }
    }
    return result;
  };

  // UPDATE: dùng !== undefined để không bỏ sót false và 0
  const updateDevice = (list, id, updateData) => {
    const index = findIndexById(list, id);
    if (index === -1) return false; // ID không tồn tại
    if (updateData === null || typeof updateData !== "object") return false;

    const device = list[index];

    if (updateData.name !== undefined) {
      if (typeof updateData.name !== "string" || updateData.name.trim() === "") return false;
    }
    if (updateData.room !== undefined) {
      if (typeof updateData.room !== "string" || updateData.room.trim() === "") return false;
    }
    if (updateData.isActive !== undefined) {
      if (typeof updateData.isActive !== "boolean") return false;
    }
    if (updateData.powerWatts !== undefined) {
      // Khi cập nhật cho phép 0 (hạ về 0W), nhưng không cho số âm / không phải số
      if (typeof updateData.powerWatts !== "number" || isNaN(updateData.powerWatts) || updateData.powerWatts < 0) {
        return false;
      }
    }

    // Đã hợp lệ hết mới ghi, tránh cập nhật dở dang
    if (updateData.name !== undefined) device.name = updateData.name.trim();
    if (updateData.room !== undefined) device.room = updateData.room.trim();
    if (updateData.isActive !== undefined) device.isActive = updateData.isActive;
    if (updateData.powerWatts !== undefined) device.powerWatts = updateData.powerWatts;

    return true;
  };

  // DELETE: xóa theo id, trả về true/false
  const deleteDevice = (list, id) => {
    const index = findIndexById(list, id);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  };

  // Chỉ xuất 4 hàm công khai
  return { createDevice, readDevicesByRoom, updateDevice, deleteDevice };
})();

// ===== KIỂM THỬ =====
const { createDevice, readDevicesByRoom, updateDevice, deleteDevice } = DeviceModule;
const devices = [];

console.log("--- 1. CREATE ---");
console.log("Thêm hợp lệ:", createDevice(devices, { name: "Điều hòa", room: "Phòng khách", powerWatts: 1200, isActive: true }));
console.log("Thêm hợp lệ:", createDevice(devices, { name: "Đèn ngủ", room: "Phòng ngủ", powerWatts: 10, isActive: true }));
console.log("Thêm hợp lệ:", createDevice(devices, { name: "Quạt trần", room: "Phòng khách", powerWatts: 60 }));
console.log("Thiếu tên:", createDevice(devices, { name: "", room: "Bếp", powerWatts: 100 }));
console.log("Thiếu phòng:", createDevice(devices, { name: "Lò vi sóng", powerWatts: 800 }));
console.log("Công suất = 0:", createDevice(devices, { name: "Tivi", room: "Phòng khách", powerWatts: 0 }));
console.log("Công suất âm:", createDevice(devices, { name: "Tivi", room: "Phòng khách", powerWatts: -5 }));
console.log("Tổng số thiết bị:", devices.length); // 3

console.log("\n--- 2. READ ---");
console.log("Phòng khách:", readDevicesByRoom(devices, "Phòng khách"));
console.log("Phòng không có thiết bị (Bếp):", readDevicesByRoom(devices, "Bếp")); // []

console.log("\n--- 3. UPDATE ---");
console.log("Tắt điều hòa (false):", updateDevice(devices, "DEV_001", { isActive: false })); // true
console.log("  isActive =", devices[0].isActive); // false
console.log("Hạ đèn ngủ về 0W:", updateDevice(devices, "DEV_002", { powerWatts: 0 })); // true
console.log("  powerWatts =", devices[1].powerWatts); // 0
console.log("ID không tồn tại:", updateDevice(devices, "DEV_999", { isActive: false })); // false
console.log("Dữ liệu sai kiểu:", updateDevice(devices, "DEV_001", { powerWatts: "abc" })); // false

console.log("\n--- 4. DELETE ---");
console.log("Xóa DEV_003:", deleteDevice(devices, "DEV_003")); // true
console.log("Xóa lại DEV_003:", deleteDevice(devices, "DEV_003")); // false
console.log("Danh sách còn lại:", devices);