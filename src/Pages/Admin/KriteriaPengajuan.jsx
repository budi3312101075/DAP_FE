import axios from "axios";
import React, { useEffect, useState } from "react";
import { toRupiah, hari } from "../../utils/helper";
import Modals from "../../Components/Moleculs/Modals";
import { useForm } from "react-hook-form";
import Button from "../../Components/Atoms/Button";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

const KriteriaPengajuan = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const {
    register: registers,
    handleSubmit: handleSubmits,
    reset: resets,
    formState,
  } = useForm();

  const [data, setData] = useState();
  const [currentData, setCurrentData] = useState();

  const [nominal, setNominal] = useState(0);
  const [special, setSpecial] = useState(0);
  console.log(special);

  function removeCommaAndConvertToInt(nominal) {
    if (typeof nominal === "string") {
      const stringWithoutComma = nominal.replace(/,/g, "");
      const result = parseInt(stringWithoutComma, 10);
      return result;
    } else {
      // Jika nominal bukan string, kembalikan nilai asli tanpa perubahan
      return nominal;
    }
  }

  const dataKriteria = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/kriteria`
      );
      setData(response.data.data);
    } catch (error) {
      console.log("Error:", error.response.data);
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log(data);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/kriteria`,
        {
          jenis_bantuan: data.jenis_bantuans,
          nominal: removeCommaAndConvertToInt(nominal),
          keterangan: data.keterangans,
          dokumen: data.dokumens,
          batas_waktu: removeCommaAndConvertToInt(data.batas_waktus),
          is_special: special,
        }
      );
      toast.success("Kriteria berhasil dibuat");
      resets();
      dataKriteria();
      document.getElementById("my_modal_1").close();
    } catch (error) {
      toast.error("Kriteria anda gagal untuk dibuat");
      console.log("Error response:", error.response.data);
    }
  };

  const onUpdate = async (data) => {
    // console.log(currentData.id);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/updateKriteria/${currentData.id}`,
        {
          jenis_bantuan: data.jenis_bantuan,
          nominal: removeCommaAndConvertToInt(nominal),
          keterangan: data.keterangan,
          dokumen: data.dokumen,
          batas_waktu: removeCommaAndConvertToInt(data.batas_waktu),
        }
      );
      reset();
      toast.success("Kriteria Berhasil diupdate");
      document.getElementById("my_modal_2").close();
      dataKriteria();
    } catch (error) {
      toast.error("Kriteria anda gagal untuk diupdate");
      document.getElementById("my_modal_2").close();
      console.log("Error:", error.response.data);
    }
  };

  const deletedKriteria = async (data) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/kriteria/${data.id}`
      );
      if (response.status === 200) {
        toast.success("kriteria Berhasil dihapus");
      }
      dataKriteria();
    } catch (error) {
      console.error("Error:", error.response.data);
    }
  };

  useEffect(() => {
    dataKriteria();
  }, []);

  useEffect(() => {
    setValue("jenis_bantuan", currentData?.jenis_bantuan);
    setNominal(currentData?.nominal);
    setValue("keterangan", currentData?.keterangan);
    setValue("dokumen", currentData?.dokumen);
    setValue("batas_waktu", currentData?.batas_waktu);
  }, [currentData]);

  return (
    <>
      <div className="h-screen flex flex-col mt-16 gap-7 bg-primary rounded-2xl p-8  font-poppins">
        <h1 className="sm:text-xl xl:text-2xl font-thin text-black">
          Daftar Kriteria
          <hr className="my-2 border-gray-500" />
        </h1>
        <button
          className="bg-secondary py-1 px-3 rounded-xl w-36 -mb-5"
          onClick={() => {
            document.getElementById("my_modal_1").showModal();
          }}
        >
          Tambah Kriteria
        </button>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr className="bg-gray-500 text-black">
                <th>No</th>
                <th>Jenis Bantuan</th>
                <th>Nominal</th>
                <th>Keterangan</th>
                <th>Dokumen</th>
                <th>special</th>
                <th>Batas Waktu</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data?.jenis_bantuan}</td>
                  <td>{toRupiah(data?.nominal)}</td>
                  <td>{data.keterangan}</td>
                  <td>{data.dokumen}</td>
                  <td>{data.is_special ? "Ya" : "Tidak"}</td>
                  <td>{hari(data.batas_waktu)}</td>
                  <td className="flex flex-col gap-1">
                    <button
                      className="bg-yellow-500 py-1 px-3 rounded-xl"
                      onClick={() => {
                        setCurrentData(data);
                        document.getElementById("my_modal_2").showModal();
                      }}
                    >
                      Ubah
                    </button>
                    <button
                      className="bg-red-500 py-1 px-3 rounded-xl"
                      onClick={() => deletedKriteria(data)}
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

      {/* tambah modal */}
      <Modals title={"Tambah Kriteria"} reset={resets}>
        <form
          onSubmit={handleSubmits(onSubmit)}
          className="flex flex-col gap-5 w-full justify-center items-center rounded-xl"
        >
          <input
            {...registers("jenis_bantuans", {
              required: "Jenis bantuan harus diisi",
              pattern: {
                value: /^[A-Za-z\s / -]+$/i,
                message: "Jenis bantuan hanya boleh mengandung huruf",
              },
            })}
            type="text"
            className={`input input-bordered w-full bg-primary border border-black placeholder:text-tertiary ${
              formState.errors.jenis_bantuans && "input-error"
            }`}
            placeholder="Masukan Jenis Bantuan"
          />
          {formState.errors.jenis_bantuans && (
            <span className="text-red-500 text-sm">
              {formState.errors.jenis_bantuans.message}
            </span>
          )}

          <NumericFormat
            allowLeadingZeros
            required={true}
            thousandSeparator=","
            placeholder="Maksimal Nominal"
            className={`input input-bordered w-full bg-primary border border-black text-black `}
            onChange={(e) => {
              setNominal(e.target.value);
            }}
          />

          <textarea
            {...registers("keterangans", {
              required: "keterangan wajib diisi",
            })}
            placeholder="keterangan"
            className={`textarea textarea-bordered w-full bg-primary border border-black text-black  ${
              formState.errors.keterangans && "input-error"
            }`}
          />
          {formState.errors.keterangan && (
            <span className="text-red-500 text-sm">
              {formState.errors.keterangans.message}
            </span>
          )}
          <input
            {...registers("dokumens", {
              required: "dokumen harus diisi",
              pattern: {
                value: /^[A-Za-z0-9\s,.-]+$/i,
                message: "dokumen hanya boleh mengandung huruf",
              },
            })}
            type="text"
            className={`input input-bordered w-full bg-primary border border-black placeholder:text-tertiary ${
              formState.errors.dokumens && "input-error"
            }`}
            placeholder="Masukan dokumen"
          />
          {formState.errors.dokumen && (
            <span className="text-red-500 text-sm">
              {formState.errors.dokumens.message}
            </span>
          )}

          <input
            {...registers("batas_waktus", {
              required: "hari harus diisi",
              pattern: {
                value: /^[0-9]+$/i,
                message: "jumlah hari hanya boleh mengandung angka",
              },
            })}
            type="text"
            className={`input input-bordered w-full bg-primary border border-black placeholder:text-tertiary ${
              formState.errors.batas_waktus && "input-error"
            }`}
            placeholder="Masukan batas waktu pengajuan"
          />
          {formState.errors.batas_waktus && (
            <span className="text-red-500 text-sm">
              {formState.errors.batas_waktus.message}
            </span>
          )}
          <div className="flex gap-2">
            <input
              type="checkbox"
              className="checkbox border-black"
              onClick={() => {
                setSpecial(0 === special ? 1 : 0);
              }}
            />
            <h1>special</h1>
          </div>
          <Button
            type="submit"
            style="w-1/2 mx-auto bg-secondary mt-2 text-primary py-1 -mb-5"
            isi="Kirim"
          />
        </form>
      </Modals>

      {/* update modal */}
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box bg-primary text-black max-w-none flex flex-col gap-8">
          <h3 className="font-bold text-lg">Ubah Kriteria</h3>
          <form
            onSubmit={handleSubmit(onUpdate)}
            className="flex flex-col gap-5 w-full justify-center items-center rounded-xl"
          >
            <input
              {...register("jenis_bantuan", {
                required: "Jenis bantuan harus diisi",
                pattern: {
                  value: /^[A-Za-z\s / -]+$/i,
                  message: "Jenis bantuan hanya boleh mengandung huruf",
                },
              })}
              type="text"
              className={`input input-bordered w-full bg-primary border border-black placeholder:text-tertiary ${
                errors.jenis_bantuan && "input-error"
              }`}
              placeholder="Masukan Jenis Bantuan"
            />
            {errors.jenis_bantuan && (
              <span className="text-red-500 text-sm">
                {errors.jenis_bantuan.message}
              </span>
            )}

            <NumericFormat
              allowLeadingZeros
              defaultValue={currentData?.nominal}
              value={currentData?.nominal}
              required={true}
              thousandSeparator=","
              placeholder="Maksimal Nominal"
              className={`input input-bordered w-full bg-primary border border-black text-black `}
              onChange={(e) => {
                setNominal(e.target.value);
              }}
            />

            <textarea
              {...register("keterangan", {
                required: "keterangan wajib diisi",
              })}
              placeholder="keterangan"
              className={`textarea textarea-bordered w-full bg-primary border border-black text-black  ${
                errors.keterangan && "input-error"
              }`}
            />
            {errors.keterangan && (
              <span className="text-red-500 text-sm">
                {errors.keterangan.message}
              </span>
            )}
            <input
              {...register("dokumen", {
                required: "dokumen harus diisi",
                pattern: {
                  value: /^[A-Za-z0-9\s,.-]+$/i,
                  message: "dokumen hanya boleh mengandung huruf",
                },
              })}
              type="text"
              className={`input input-bordered w-full bg-primary border border-black placeholder:text-tertiary ${
                errors.dokumen && "input-error"
              }`}
              placeholder="Masukan dokumen"
            />
            {errors.dokumen && (
              <span className="text-red-500 text-sm">
                {errors.dokumen.message}
              </span>
            )}

            <input
              {...register("batas_waktu", {
                required: "hari harus diisi",
                pattern: {
                  value: /^[0-9]+$/i,
                  message: "jumlah hari hanya boleh mengandung angka",
                },
              })}
              type="text"
              className={`input input-bordered w-full bg-primary border border-black placeholder:text-tertiary ${
                errors.batas_waktu && "input-error"
              }`}
              placeholder="Masukan batas waktu pengajuan"
            />
            {errors.batas_waktu && (
              <span className="text-red-500 text-sm">
                {errors.batas_waktu.message}
              </span>
            )}
            <Button
              type="submit"
              style="w-1/2 mx-auto bg-secondary mt-2 text-primary py-1"
              isi="Kirim"
            />
          </form>
          <button
            className="px-4 py-2 bg-black rounded-lg text-white w-full "
            onClick={() => {
              document.getElementById("my_modal_2").close();
            }}
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
};

export default KriteriaPengajuan;
