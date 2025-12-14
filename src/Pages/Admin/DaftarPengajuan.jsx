import axios from "axios";
import React, { useEffect, useState } from "react";
import { toRupiah, formatDate } from "../../utils/helper";
import { useForm } from "react-hook-form";
import Modals from "../../Components/Moleculs/Modals";
import Button from "../../Components/Atoms/Button";
import { toast } from "react-toastify";
import { NumericFormat } from "react-number-format";

const DaftarPengajuan = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const {
    register: registers,
    handleSubmit: handleSubmits,
    reset: resets,
    formState: { errorss },
  } = useForm();

  const [data, setData] = useState();
  const [currentData, setCurrentData] = useState();
  const [selectedStatus, setSelectedStatus] = useState();
  const [filter, setFilter] = useState({
    tanggalAwal: "",
    tanggalAkhir: "",
    tahun: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [users, setUsers] = useState([]);
  const [kriteria, setKriteria] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [nominal, setNominal] = useState();
  const currentDate = new Date().toISOString().split("T")[0];

  const addData = async (data) => {
    const formData = new FormData();
    formData.append("tanggal", currentDate);
    formData.append("deskripsi", data.deskripsi);
    formData.append("id_kriteria", data.id_kriteria);
    formData.append("bukti", data.bukti[0]);
    formData.append("id_users", data.id_users);

    if (isSpecial) {
      formData.append("nominal", nominal); // Hanya kirim nominal jika is_special = 1
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/pengajuan`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Pengajuan berhasil dikirim");
      resets();
      document.getElementById("jlarj2983idfw").close();
      pengajuan();
    } catch (error) {
      resets;
      document.getElementById("jlarj2983idfw").close();
      toast.error(error.response.data.msg);

      console.log("Error:", error.response.data);
    }
  };

  const onSubmit = async (data) => {
    let requestBody = {
      status: data?.status,
      deskripsi_status: data?.deskripsi_status,
      id_users: currentData?.usersId,
    };

    if (data?.status === "selesai") {
      requestBody.bukti_transfer = data?.bukti_transfer[0];
      if (!requestBody.bukti_transfer) {
        toast.error("Bukti transfer harus diisi jika status sudah selesai");
        document.getElementById("my_modal_1").close();
        reset();
        return;
      }
    }

    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/konfirmasi/${currentData.id}`,
      requestBody,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response.status === 200) {
      toast.success("Pengajuan Berhasil dikonfirmasi");
      reset();
    }
    pengajuan();
    document.getElementById("my_modal_1").close();
  };

  const pengajuan = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/pengajuan`
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error:", error.response.data);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
      setUsers(response.data.data);
      setFilteredUsers(response.data.data); // Initialize filtered users
    } catch (error) {
      console.error("Error:", error.response.data);
    }
  };

  const getKriteria = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/kriteria`
      );
      setKriteria(response.data.data);
    } catch (error) {
      console.error("Error:", error.response.data);
    }
  };

  const handleKriteriaChange = (e) => {
    const selectedId = e.target.value;

    // Temukan kriteria yang dipilih
    const selectedKriteria = kriteria.find(
      (kriteria) => kriteria.id === Number(selectedId)
    );

    if (selectedKriteria && selectedKriteria.is_special === 1) {
      setIsSpecial(true);
    } else {
      setIsSpecial(false);
      clearErrors("nominal"); // Jika bukan special, bersihkan error di field nominal
    }

    // Set value untuk id_kriteria
    setValue("id_kriteria", selectedId);
  };

  const deletedPengajuan = async (data) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/pengajuan/${data.id}`
      );
      if (response.status === 200) {
        toast.success("Pengajuan Berhasil dihapus");
      }
      pengajuan();
    } catch (error) {
      console.error("Error:", error.response.data);
    }
  };

  useEffect(() => {
    getUsers();
    getKriteria();
    pengajuan();
  }, []);

  const handleSearchUsers = (searchTerm) => {
    setSearchTerm(searchTerm);
    const filtered = users.filter((user) =>
      user.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilter((prevFilter) => ({ ...prevFilter, [field]: value }));
  };

  useEffect(() => {
    const newFilteredData = data
      ? data.filter((data) => {
          const isTanggalMatch =
            (!filter.tanggalAwal || data.tanggal >= filter.tanggalAwal) &&
            (!filter.tanggalAkhir || data.tanggal <= filter.tanggalAkhir);
          const isTahunMatch =
            !filter.tahun || data.tanggal.includes(filter.tahun);
          return isTanggalMatch && isTahunMatch;
        })
      : [];

    setFilteredData(newFilteredData);
  }, [data, filter]);

  return (
    <>
      <div className="h-screen flex flex-col mt-16 gap-7 bg-primary rounded-2xl p-8 sm:p-8 font-poppins">
        <h1 className="sm:text-xl xl:text-2xl font-thin text-black">
          Daftar Pengajuan
          <hr className="my-2 border-gray-500" />
        </h1>
        <div className="flex justify-between">
          <button
            className="bg-secondary px-4 py-1 rounded-lg"
            onClick={() => document.getElementById("jlarj2983idfw").showModal()}
          >
            Tambah Pengajuan
          </button>
          <div className="flex gap-2  justify-end">
            <input
              type="text"
              placeholder="Filter by Tahun"
              className="input input-bordered w-full max-w-xs bg-primary border border-black"
              onChange={(e) => handleFilterChange("tahun", e.target.value)}
            />
            <input
              type="date"
              placeholder="Filter by Tanggal Awal"
              className="input input-bordered w-full max-w-xs bg-primary border border-black"
              onChange={(e) =>
                handleFilterChange("tanggalAwal", e.target.value)
              }
            />
            <input
              type="date"
              placeholder="Filter by Tanggal Akhir"
              className="input input-bordered w-full max-w-xs bg-primary border border-black"
              onChange={(e) =>
                handleFilterChange("tanggalAkhir", e.target.value)
              }
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr className="bg-gray-500 text-black">
                <th>No</th>
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Nominal</th>
                <th>Telepon</th>
                <th>Jenis Bantuan</th>
                <th>Bukti</th>
                <th>Status</th>
                <th>Deskripsi Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((filteredData, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{filteredData?.nama}</td>
                  <td>{formatDate(filteredData?.tanggal)}</td>
                  <td>{filteredData?.deskripsi}</td>
                  <td>{toRupiah(filteredData?.nominal)}</td>
                  <td>{filteredData?.no_telepon}</td>
                  <td>{filteredData?.jenis_bantuan}</td>
                  <td>
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${
                        filteredData?.bukti
                      }`}
                      alt=""
                      className="w-14"
                    />
                  </td>
                  <td>{filteredData?.status}</td>
                  <td>{filteredData?.deskripsi_status}</td>
                  <td className="flex flex-col gap-1">
                    <button
                      className={`bg-secondary py-1 px-3 rounded-xl ${
                        filteredData?.status === "selesai" ? "btn-disabled" : ""
                      } `}
                      onClick={() => {
                        setCurrentData(filteredData);
                        document.getElementById("my_modal_1").showModal();
                      }}
                    >
                      Konfirmasi
                    </button>
                    <button
                      className="bg-red-500 py-1 px-3 rounded-xl"
                      onClick={() => {
                        deletedPengajuan(filteredData);
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* modal tambah data */}
      <dialog id="jlarj2983idfw" className="modal">
        <div className="modal-box bg-primary text-black max-w-xl mx-auto rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-center">
            Tambah Data Pengajuan
          </h3>
          <form
            onSubmit={handleSubmits(addData)}
            className="flex flex-col gap-4 w-full"
          >
            <div className="w-full">
              <label className="label">
                <span className="label-text">Cari Nama User</span>
              </label>
              <input
                type="text"
                placeholder="Cari Nama User"
                value={searchTerm}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="input input-bordered w-full bg-white border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none rounded-md"
              />
            </div>

            <div className="w-full">
              <label className="label">
                <span className="label-text">Pilih Nama</span>
              </label>
              <select
                {...registers("id_users")}
                className="input input-bordered w-full bg-white border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none rounded-md"
              >
                {filteredUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className="label">
                <span className="label-text">Pilih kriteria</span>
              </label>
              <select
                {...registers("id_kriteria")}
                className="input input-bordered w-full bg-white border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none rounded-md "
                onChange={handleKriteriaChange}
              >
                {kriteria.map((kriteria) => (
                  <option key={kriteria.id} value={kriteria.id}>
                    {kriteria.jenis_bantuan}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className="label">
                <span className="label-text">Deskripsi</span>
              </label>
              <textarea
                type="text"
                placeholder="Deskripsi"
                className="textarea textarea-bordered w-full bg-white border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none rounded-md"
                {...registers("deskripsi")}
              />
            </div>

            {isSpecial && (
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Nominal</span>
                </label>
                <NumericFormat
                  thousandSeparator=","
                  prefix="Rp "
                  placeholder="Nominal"
                  className="input input-bordered w-full bg-white border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none rounded-md"
                  value={nominal}
                  onValueChange={(values) => {
                    const { value } = values;
                    setNominal(value);
                  }}
                />
              </div>
            )}

            <div className="w-full">
              <label className="label">
                <span className="label-text">Upload Bukti</span>
              </label>
              <input
                {...registers("bukti", { required: "Bukti wajib diupload" })}
                type="file"
                className={`file-input file-input-bordered w-full bg-white border border-gray-300 focus:ring focus:ring-blue-200 focus:outline-none rounded-md ${
                  errors.bukti && "input-error"
                }`}
              />
              {errors.bukti && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.bukti.message}
                </span>
              )}
            </div>

            <div className="text-center mt-4 flex flex-col gap-2">
              <button
                type="submit"
                className="btn bg-secondary hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full transition-all duration-300"
              >
                Simpan Pengajuan
              </button>
              <span
                className="btn"
                onClick={() => {
                  resets(), document.getElementById("jlarj2983idfw").close();
                }}
              >
                Close
              </span>
            </div>
          </form>
        </div>
      </dialog>

      {/* modal konfirmasi pengajuan */}
      <Modals title="Konfirmasi Pengajuan" reset={reset}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="flex flex-col gap-5 w-full justify-center items-center rounded-xl"
        >
          <h1 className="w-full -mb-3">Status</h1>
          <select
            {...register("status", {
              required: "status wajib dipilih",
            })}
            className={`select select-bordered w-full bg-primary border border-black text-black${
              errors["status"] && "input-error"
            }`}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option disabled>Pilih Status</option>
            <option value=""></option>
            <option value="selesai">Selesai</option>
            <option value="ditangguhkan">Ditangguhkan</option>
            <option value="tolak">Tolak</option>
          </select>
          {errors["status"] && (
            <span className="text-red-500 text-sm">
              {errors["status"].message}
            </span>
          )}

          <textarea
            {...register("deskripsi_status", {
              required: "deskripsi status wajib diisi",
            })}
            placeholder="deskripsi status bantuan"
            className={`textarea textarea-bordered w-full bg-primary border border-black text-black  ${
              errors.deskripsi_status && "input-error"
            }`}
          />
          {errors.deskripsi_status && (
            <span className="text-red-500 text-sm">
              {errors.deskripsi_status.message}
            </span>
          )}

          <input
            {...register("bukti_transfer")}
            type="file"
            className={`file-input file-input-bordered w-full bg-primary border border-black text-black ${
              selectedStatus !== "selesai" ? "hidden" : ""
            }`}
          />
          <Button
            type="submit"
            style="w-1/2 mx-auto bg-secondary mt-2 text-primary py-1 -mb-5"
            isi="Kirim"
          />
        </form>
      </Modals>
    </>
  );
};

export default DaftarPengajuan;
