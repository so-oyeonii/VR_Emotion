import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { createEmotionsBatch } from '../services/api';
import './EmotionSelect.css';

// GEW 프레임워크 + Jonauskaite et al. 실증 데이터 기반 색상
const EMOTIONS = [
  { name: '분노', hex: '#D32F2F', desc: '화가 나거나 짜증이 난 느낌' },
  { name: '슬픔', hex: '#1565C0', desc: '우울하거나 기운이 없는 느낌' },
  { name: '소외감', hex: '#607D8B', desc: '혼자 남겨진 느낌, 무시당한 느낌' },
  { name: '수치심', hex: '#6A1B9A', desc: '부끄럽거나 창피한 느낌' },
  { name: '불안', hex: '#2E7D32', desc: '걱정되거나 초조한 느낌' },
  { name: '무관심', hex: '#8D6E63', desc: '아무 감정도 들지 않는 느낌' },
  { name: '두려움', hex: '#263238', desc: '무섭거나 겁이 나는 느낌' },
  { name: '좌절감', hex: '#E64A19', desc: '답답하고 막막한 느낌' },
  { name: '놀람', hex: '#F9A825', desc: '예상치 못한 일에 놀란 느낌' },
  { name: '평온', hex: '#00ACC1', desc: '편안하고 차분한 느낌' },
];

function EmotionSelect() {
  const navigate = useNavigate();
  const { userData, setScreen } = useStore();
  const [selected, setSelected] = useState([]); // [{ name, hex, intensity }]
  const [error, setError] = useState('');

  if (!userData.userId) {
    navigate('/');
    return null;
  }

  const toggleEmotion = (emotion) => {
    setError('');
    const idx = selected.findIndex((s) => s.name === emotion.name);
    if (idx !== -1) {
      setSelected(selected.filter((_, i) => i !== idx));
    } else {
      if (selected.length >= 3) {
        setError('최대 3개까지 선택할 수 있습니다');
        return;
      }
      setSelected([...selected, { name: emotion.name, hex: emotion.hex, intensity: 5 }]);
    }
  };

  const setIntensity = (emotionName, intensity) => {
    setSelected(selected.map((s) =>
      s.name === emotionName ? { ...s, intensity } : s
    ));
  };

  const isSelected = (name) => selected.some((s) => s.name === name);

  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (selected.length === 0) {
      setError('최소 1개의 감정을 선택해주세요');
      return;
    }
    if (saving) return;
    setSaving(true);

    const emotionData = selected.map((s, i) => ({
      emotion: s.name,
      color: s.hex,
      intensity: s.intensity,
      sequence_order: i + 1,
    }));

    try {
      await createEmotionsBatch(userData.userId, emotionData);

      const store = useStore.getState();
      store.clearSelectedEmotions();
      selected.forEach((s) => {
        store.addSelectedEmotion(s.name, s.hex);
      });
      useStore.setState({ emotionIntensities: emotionData });

      setScreen(5);
      navigate('/complete');
    } catch (err) {
      console.error('감정 저장 오류:', err);
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSaving(false);
    }
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

        {/* 구체 그리드 */}
        <div className="sphere-grid">
          {EMOTIONS.map((emotion) => {
            const active = isSelected(emotion.name);
            return (
              <button
                key={emotion.name}
                className={`sphere-item ${active ? 'active' : ''}`}
                onClick={() => toggleEmotion(emotion)}
              >
                <div
                  className="sphere"
                  style={{
                    '--sphere-color': emotion.hex,
                    '--sphere-light': lighten(emotion.hex, 90),
                    '--sphere-glow': `${emotion.hex}60`,
                  }}
                >
                  <div className="sphere-shine"></div>
                </div>
                <span className="sphere-name">{emotion.name}</span>
                <span className="sphere-desc">{emotion.desc}</span>
                {active && <div className="sphere-check">&#10003;</div>}
              </button>
            );
          })}
        </div>

        {/* 선택된 감정의 강도 설정 */}
        {selected.length > 0 && (
          <div className="intensity-section">
            <h2 className="intensity-title">감정 강도 설정</h2>
            <p className="intensity-desc">각 감정의 강도를 1~10으로 설정해주세요</p>

            <div className="intensity-list">
              {selected.map((s) => (
                <div key={s.name} className="intensity-item" style={{ '--emotion-color': s.hex }}>
                  <div className="intensity-label">
                    <div
                      className="intensity-sphere-mini"
                      style={{
                        '--sphere-color': s.hex,
                        '--sphere-light': lighten(s.hex, 90),
                      }}
                    >
                      <div className="sphere-shine-mini"></div>
                    </div>
                    <span className="intensity-name">{s.name}</span>
                    <span className="intensity-value">{s.intensity}</span>
                  </div>
                  <div className="slider-container">
                    <span className="slider-min">약하게</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={s.intensity}
                      onChange={(e) => setIntensity(s.name, Number(e.target.value))}
                      className="intensity-slider"
                      style={{
                        '--slider-color': s.hex,
                        '--slider-progress': `${((s.intensity - 1) / 9) * 100}%`,
                      }}
                    />
                    <span className="slider-max">강하게</span>
                  </div>
                  {/* 강도에 따른 구체 크기 미리보기 */}
                  <div className="bubble-preview">
                    <div
                      className="bubble-sphere"
                      style={{
                        width: `${24 + s.intensity * 5}px`,
                        height: `${24 + s.intensity * 5}px`,
                        '--sphere-color': s.hex,
                        '--sphere-light': lighten(s.hex, 90),
                        '--sphere-glow': `${s.hex}${Math.round(30 + s.intensity * 7).toString(16)}`,
                      }}
                    >
                      <div className="sphere-shine-mini"></div>
                    </div>
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

function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
  const b = Math.min(255, (num & 0xFF) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export default EmotionSelect;
