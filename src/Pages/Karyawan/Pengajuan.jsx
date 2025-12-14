import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../Components/Atoms/Button";
import { detailUser } from "../../utils/helper";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

const Pengajuan = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue, // Untuk menetapkan nilai secara dinamis
    clearErrors, // Untuk menghapus error jika tidak ada kesalahan
  } = useForm();

  const currentDate = new Date().toISOString().split("T")[0];

  const user = detailUser();
  const [bantuan, setBantuan] = useState([]);
  const [isSpecial, setIsSpecial] = useState(false); // State untuk menentukan apakah bantuan special

  // Fungsi untuk mengambil daftar kriteria
  const jenisBantuan = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/kriteria`
      );
      setBantuan(response.data.data);
    } catch (error) {
      console.log("Error:", error.response.data);
    }
  };

  useEffect(() => {
    jenisBantuan();
  }, []);

  // Handler untuk mengubah kriteria yang dipilih
  const handleKriteriaChange = (e) => {
    const selectedId = e.target.value;

    // Temukan bantuan yang dipilih
    const selectedBantuan = bantuan.find(
      (bantuan) => bantuan.id === Number(selectedId)
    );

    if (selectedBantuan && selectedBantuan.is_special === 1) {
      setIsSpecial(true);
    } else {
      setIsSpecial(false);
      clearErrors("nominal"); // Jika bukan special, bersihkan error di field nominal
    }

    // Set value untuk id_kriteria
    setValue("id_kriteria", selectedId);
  };

  const onSubmit = async (data) => {
    const isConfirmed = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda tidak dapat membatalkan pengajuan setelah dikirim.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, kirim pengajuan!",
    });

    if (isConfirmed.isConfirmed) {
      const formData = new FormData();
      formData.append("tanggal", data.tanggal);
      formData.append("deskripsi", data.deskripsi);
      formData.append("id_kriteria", data.id_kriteria);
      formData.append("bukti", data.bukti[0]);
      formData.append("id_users", user.id);

      if (isSpecial) {
        formData.append("nominal", data.nominal); // Hanya kirim nominal jika is_special = 1
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
        reset();
      } catch (error) {
        if (error.response.status === 400) {
          toast.error("Pengajuan ditolak karena masih dalam batas waktu");
        } else {
          toast.error("Pengajuan anda gagal untuk dikirim");
        }
        console.log("Error:", error.response.data);
      }
    }
  };

  return (
    <div className="max-h-max p-12 bg-primary pt-24 font-poppins pb-32">
      <div className="flex flex-col justify-center items-center pt-10">
        <h1 className="font-semibold text-2xl xl:text-3xl mb-5 text-black">
          Form Pengajuan
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="flex flex-col gap-5 w-full max-w-2xl p-10 justify-center items-center bg-primary rounded-xl drop-shadow-2xl"
          data-aos="zoom-in"
          data-aos-duration="1000"
        >
          <input
            {...register("tanggal", { required: "Tanggal wajib diisi" })}
            type="date"
            className={`input input-bordered w-full max-w-lg bg-primary border border-black hidden ${
              errors.tanggal && "input-error"
            }`}
            defaultValue={currentDate}
          />
          {errors.tanggal && (
            <span className="text-red-500 text-sm">
              {errors.tanggal.message}
            </span>
          )}

          <select
            {...register("id_kriteria", {
              required: "jenis bantuan wajib dipilih",
            })}
            className={`select select-bordered w-full max-w-lg bg-primary border border-black text-black ${
              errors["id_kriteria"] && "input-error"
            }`}
            onChange={handleKriteriaChange} // Tambahkan handler untuk menangani perubahan kriteria
          >
            <option value="">Pilih Jenis Bantuan</option>
            {bantuan?.map((bantuan, index) => (
              <option key={index} value={bantuan.id}>
                {bantuan.jenis_bantuan}
              </option>
            ))}
          </select>
          {errors["id_kriteria"] && (
            <span className="text-red-500 text-sm">
              {errors["id_kriteria"].message}
            </span>
          )}

          <textarea
            {...register("deskripsi", { required: "Deskripsi wajib diisi" })}
            placeholder="Deskripsi bantuan"
            className={`textarea textarea-bordered w-full max-w-lg bg-primary border border-black text-black placeholder:pt-3 ${
              errors.deskripsi && "input-error"
            }`}
          />
          {errors.deskripsi && (
            <span className="text-red-500 text-sm">
              {errors.deskripsi.message}
            </span>
          )}

          <input
            {...register("bukti", { required: "Bukti wajib diupload" })}
            type="file"
            className={`file-input file-input-bordered w-full max-w-lg bg-primary border border-black text-black${
              errors.bukti && "input-error"
            }`}
          />
          {errors.bukti && (
            <span className="text-red-500 text-sm">{errors.bukti.message}</span>
          )}

          {/* Tampilkan dan wajibkan input nominal jika kriteria memiliki is_special = 1 */}
          {isSpecial && (
            <input
              {...register("nominal", {
                required: "Nominal wajib diisi untuk bantuan ini",
              })}
              type="text"
              placeholder="Masukkan Nominal"
              className={`input input-bordered w-full max-w-lg bg-primary border border-black text-black ${
                errors.nominal && "input-error"
              }`}
            />
          )}
          {errors.nominal && (
            <span className="text-red-500 text-sm">
              {errors.nominal.message}
            </span>
          )}

          <Button
            type="submit"
            style="w-1/2 mx-auto bg-secondary mt-2 text-primary py-1"
            isi="Kirim"
          />
        </form>
      </div>
    </div>
  );
};

export default Pengajuan;
