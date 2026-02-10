import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './EmotionSelect.css';

const EMOTIONS = [
  { name: '분노', color: '#DC143C', desc: '화가 나거나 짜증이 난 느낌' },
  { name: '슬픔', color: '#4169E1', desc: '우울하거나 기운이 없는 느낌' },
  { name: '소외감', color: '#8B4513', desc: '혼자 남겨진 느낌, 무시당한 느낌' },
  { name: '수치심', color: '#800080', desc: '부끄럽거나 창피한 느낌' },
  { name: '불안', color: '#FF8C00', desc: '걱정되거나 초조한 느낌' },
  { name: '무관심', color: '#708090', desc: '아무 감정도 들지 않는 느낌' },
  { name: '두려움', color: '#4B0082', desc: '무섭거나 겁이 나는 느낌' },
  { name: '좌절감', color: '#B22222', desc: '답답하고 막막한 느낌' },
  { name: '놀람', color: '#FF69B4', desc: '예상치 못한 일에 놀란 느낌' },
  { name: '평온', color: '#87CEEB', desc: '편안하고 차분한 느낌' },
];

function EmotionSelect() {
  const navigate = useNavigate();
  const { userData, setScreen } = useStore();
  const [selected, setSelected] = useState([]); // [{ name, color, intensity }]
  const [error, setError] = useState('');

  if (!userData.userId) {
    navigate('/');
    return null;
  }

  const toggleEmotion = (emotion) => {
    setError('');
    const idx = selected.findIndex((s) => s.name === emotion.name);
    if (idx !== -1) {
      // 선택 해제
      setSelected(selected.filter((_, i) => i !== idx));
    } else {
      if (selected.length >= 3) {
        setError('최대 3개까지 선택할 수 있습니다');
        return;
      }
      setSelected([...selected, { name: emotion.name, color: emotion.color, intensity: 5 }]);
    }
  };

  const setIntensity = (emotionName, intensity) => {
    setSelected(selected.map((s) =>
      s.name === emotionName ? { ...s, intensity } : s
    ));
  };

  const isSelected = (name) => selected.some((s) => s.name === name);

  const handleNext = () => {
    if (selected.length === 0) {
      setError('최소 1개의 감정을 선택해주세요');
      return;
    }

    // 스토어에 저장
    const store = useStore.getState();
    store.clearSelectedEmotions();
    selected.forEach((s) => {
      store.addSelectedEmotion(s.name, s.color);
    });

    // 강도도 바로 설정
    useStore.setState({
      emotionIntensities: selected.map((s, i) => ({
        emotion: s.name,
        color: s.color,
        intensity: s.intensity,
        sequence_order: i + 1,
      })),
    });

    setScreen(5);
    navigate('/complete');
  };

  return (
    <div className="emotion-select-container">
      <div className="emotion-select-panel">
        <div className="emotion-select-header">
          <h1>감정 선택</h1>
          <p className="emotion-select-desc">
            방금 게임에서 느낀 감정을 선택해주세요. (최대 3개)
          </p>
        </div>

        <div className="emotion-grid">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.name}
              className={`emotion-card ${isSelected(emotion.name) ? 'active' : ''}`}
              style={{ '--emotion-color': emotion.color }}
              onClick={() => toggleEmotion(emotion)}
            >
              <span className="emotion-card-name">{emotion.name}</span>
              <span className="emotion-card-desc">{emotion.desc}</span>
            </button>
          ))}
        </div>

        {/* 선택된 감정의 강도 설정 */}
        {selected.length > 0 && (
          <div className="intensity-section">
            <h2 className="intensity-title">감정 강도 설정</h2>
            <p className="intensity-desc">각 감정의 강도를 1~10으로 설정해주세요</p>

            <div className="intensity-list">
              {selected.map((s) => (
                <div key={s.name} className="intensity-item" style={{ '--emotion-color': s.color }}>
                  <div className="intensity-label">
                    <span className="intensity-dot" style={{ background: s.color }}></span>
                    <span className="intensity-name">{s.name}</span>
                    <span className="intensity-value">{s.intensity}</span>
                  </div>
                  <div className="slider-container">
                    <span className="slider-min">1</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={s.intensity}
                      onChange={(e) => setIntensity(s.name, Number(e.target.value))}
                      className="intensity-slider"
                      style={{
                        '--slider-color': s.color,
                        '--slider-progress': `${((s.intensity - 1) / 9) * 100}%`,
                      }}
                    />
                    <span className="slider-max">10</span>
                  </div>
                  {/* 강도에 따른 버블 미리보기 */}
                  <div className="bubble-preview">
                    <div
                      className="bubble"
                      style={{
                        width: `${20 + s.intensity * 6}px`,
                        height: `${20 + s.intensity * 6}px`,
                        background: `radial-gradient(circle at 35% 35%, ${lighten(s.color)}, ${s.color})`,
                        boxShadow: `0 0 ${s.intensity * 3}px ${s.color}40`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="emotion-select-footer">
          <span className="select-count">{selected.length} / 3 선택</span>
          <button
            className="next-button"
            onClick={handleNext}
            disabled={selected.length === 0}
          >
            완료
          </button>
        </div>

        <div className="progress-indicator">
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot active"></div>
        </div>
      </div>
    </div>
  );
}

function lighten(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + 80);
  const g = Math.min(255, ((num >> 8) & 0xFF) + 80);
  const b = Math.min(255, (num & 0xFF) + 80);
  return `rgb(${r}, ${g}, ${b})`;
}

export default EmotionSelect;
