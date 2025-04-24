// frontend/src/pages/Register/RegisterPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '@api/authService'
import styles from './RegisterPage.module.scss'

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    // Валидация имени
    if (!name) {
      newErrors.name = 'Имя обязательно'
    } else if (name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа'
    }

    // Валидация email
    if (!email) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Неверный формат email'
    }

    // Валидация пароля
    if (!password) {
      newErrors.password = 'Пароль обязателен'
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов'
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      newErrors.password = 'Пароль должен содержать буквы и цифры'
    }

    // Валидация подтверждения пароля
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await register({ name, email, password })
      navigate('/login')
    } catch (error: any) {
      console.error('Registration error:', error)
      
      if (error.response?.status === 409) {
        setErrors({
          general: error.response.data.message || 'Пользователь с таким email уже существует'
        })
      } else if (error.response?.status === 400) {
        // Ошибки валидации
        setErrors(error.response.data.errors || {
          general: error.response.data.message
        })
      } else if (error.response?.data?.message) {
        setErrors({
          general: error.response.data.message
        })
      } else {
        setErrors({
          general: 'Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2>Создать аккаунт</h2>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            type="text"
            placeholder="Введите ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Подтверждение пароля</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className={styles.error}>{errors.confirmPassword}</span>
          )}
        </div>

        {errors.general && (
          <div className={styles.error} style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className={styles.loginLink}>
        Уже есть аккаунт?<Link to="/login">Войти</Link>
      </p>
    </div>
  )
}
