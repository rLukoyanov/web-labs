import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { updateUserAsync } from "../../store/slices/userSlice";
import styles from "./Profile.module.scss";
import Navigation from "@components/Navigation/Navigation";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  gender: "male" | "female";
  birthDate: string;
};

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector(
    (state: RootState) => state.user
  );
  const [isEditing, setIsEditing] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormValues>({
    defaultValues: {
      firstName: currentUser?.name?.split(" ")[0] || "",
      lastName: currentUser?.name?.split(" ")[1] || "",
      email: currentUser?.email || "",
      gender: currentUser?.gender || "",
      birthDate: currentUser?.birthDate?.split("T")[0] || "",
    },
  });

  useEffect(() => {
    setValue("firstName", currentUser?.name.split(" ")[0])
    setValue("lastName", currentUser?.name.split(" ")[1])
    setValue("birthDate", currentUser?.birthDate?.split("T")[0])
    setValue('gender', currentUser?.gender)
    setValue('email', currentUser?.email)
  }, [currentUser]);

  console.log(currentUser?.name.split(" ")[0]);

  if (!currentUser) {
    return <div>Пользователь не авторизован</div>;
  }

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(updateUserAsync(data)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  return (
    <>
      <Navigation />
      <div className={styles.profile}>
        <h2>Профиль пользователя</h2>

        {error && <div className={styles.error}>{error}</div>}

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Имя:</label>
              <input
                type="text"
                {...register("firstName", { required: "Имя обязательно" })}
              />
              {errors.firstName && <span>{errors.firstName.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Фамилия:</label>
              <input
                type="text"
                {...register("lastName", { required: "Фамилия обязательна" })}
              />
              {errors.lastName && <span>{errors.lastName.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                {...register("email", { required: "Email обязателен" })}
              />
              {errors.email && <span>{errors.email.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Пол:</label>
              <select {...register("gender", { required: "Пол обязателен" })}>
                <option value="">Выберите пол</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
              {errors.gender && <span>{errors.gender.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Дата рождения:</label>
              <input
                type="date"
                {...register("birthDate", { required: "Дата обязательна" })}
              />
              {errors.birthDate && <span>{errors.birthDate.message}</span>}
            </div>
            <div className={styles.buttons}>
              <button type="submit" disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset(); // сброс значений к текущему пользователю
                }}
                disabled={loading}
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.info}>
            <p>
              <strong>Имя и фамилия:</strong>{" "}
              {`${currentUser.name}`}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p>
              <strong>Пол:</strong>{" "}
              {currentUser.gender === "male" ? "Мужской" : "Женский"}
            </p>
            <p>
              <strong>Дата рождения:</strong>{" "}
              {new Date(currentUser.birthDate).toLocaleDateString()}
            </p>
            <button onClick={() => setIsEditing(true)}>Редактировать</button>
          </div>
        )}
      </div>
    </>
  );
};
