import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { createUser } from '../services/api';
import './UserInfo.css';

function UserInfo() {
  const navigate = useNavigate();
  const { setUserData, setScreen } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '2000-01-07',
    phone_last_four: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name || !formData.birthdate || !formData.phone_last_four) {
      setError('모든 필드를 입력해주세요');
      return;
    }
    
    if (formData.phone_last_four.length !== 4 || !/^\d+$/.test(formData.phone_last_four)) {
      setError('전화번호 뒷자리는 숫자 4자리여야 합니다');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await createUser(formData);
      
      setUserData({
        name: response.name,
        birthdate: response.birthdate,
        phone_last_four: response.phone_last_four,
        userId: response.id
      });
      
      setScreen(1);
      navigate('/aaq');
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || '사용자 생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-info-container">
      <div className="stars"></div>
      <div className="user-info-panel">
        <h1 className="title">감정 연구 참여</h1>
        <p className="subtitle">정보를 입력해주세요</p>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="birthdate">생년월일</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone_last_four">전화번호 뒷자리 (4자리)</label>
            <input
              type="text"
              id="phone_last_four"
              name="phone_last_four"
              value={formData.phone_last_four}
              onChange={handleChange}
              placeholder="1234"
              maxLength={4}
              disabled={loading}
              required
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? '처리중...' : '시작하기'}
          </button>
        </form>
        
        <div className="progress-indicator">
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
