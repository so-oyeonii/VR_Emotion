import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './Questionnaire.css';

// PANAS (Positive and Negative Affect Schedule)
// 5-point Likert scale: 1(전혀 그렇지 않다) ~ 5(매우 그렇다)
const PANAS_ITEMS = [
  // Positive Affect (PA)
  { text: '관심이 있는', type: 'PA' },
  { text: '흥분된', type: 'PA' },
  { text: '강한', type: 'PA' },
  { text: '열정적인', type: 'PA' },
  { text: '자랑스러운', type: 'PA' },
  { text: '기민한', type: 'PA' },
  { text: '고무된', type: 'PA' },
  { text: '결연한', type: 'PA' },
  { text: '주의 깊은', type: 'PA' },
  { text: '활기찬', type: 'PA' },
  // Negative Affect (NA)
  { text: '괴로운', type: 'NA' },
  { text: '속상한', type: 'NA' },
  { text: '죄책감이 드는', type: 'NA' },
  { text: '겁먹은', type: 'NA' },
  { text: '적대적인', type: 'NA' },
  { text: '짜증나는', type: 'NA' },
  { text: '부끄러운', type: 'NA' },
  { text: '초조한', type: 'NA' },
  { text: '불안한', type: 'NA' },
  { text: '두려운', type: 'NA' },
];

const SCALE_LABELS = [
  '전혀\n그렇지\n않다',
  '약간\n그렇다',
  '보통\n이다',
  '상당히\n그렇다',
  '매우\n그렇다',
];

function PANAS() {
  const navigate = useNavigate();
  const { userData, setScreen } = useStore();
  const [responses, setResponses] = useState(Array(PANAS_ITEMS.length).fill(null));

  if (!userData.userId) {
    navigate('/');
    return null;
  }

  const handleResponse = (itemIndex, value) => {
    const newResponses = [...responses];
    newResponses[itemIndex] = value;
    setResponses(newResponses);
  };

  const allAnswered = responses.every((r) => r !== null);

  const handleNext = () => {
    if (!allAnswered) return;
    useStore.getState().setPANASResponses(responses.map((val, idx) => ({
      item: PANAS_ITEMS[idx].text,
      type: PANAS_ITEMS[idx].type,
      value: val,
    })));
    setScreen(3);
    navigate('/game');
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-panel">
        <div className="questionnaire-header">
          <h1>현재 정서 상태 설문</h1>
          <p className="questionnaire-desc">
            현재 자신의 기분이나 감정 상태를 가장 잘 나타내는 정도를 선택해 주세요.
          </p>
        </div>

        <div className="scale-legend">
          {SCALE_LABELS.map((label, i) => (
            <div key={i} className="scale-legend-item">
              <span className="scale-num">{i + 1}</span>
              <span className="scale-text">{label}</span>
            </div>
          ))}
        </div>

        <div className="questions-list">
          {PANAS_ITEMS.map((item, idx) => (
            <div key={idx} className={`question-card ${responses[idx] !== null ? 'answered' : ''}`}>
              <div className="question-number">{idx + 1}</div>
              <p className="question-text">{item.text}</p>
              <div className="likert-scale five-point">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    className={`likert-btn ${responses[idx] === val ? 'selected' : ''}`}
                    onClick={() => handleResponse(idx, val)}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="questionnaire-footer">
          <div className="progress-text">
            {responses.filter((r) => r !== null).length} / {PANAS_ITEMS.length} 응답 완료
          </div>
          <button
            className="next-button"
            onClick={handleNext}
            disabled={!allAnswered}
          >
            {allAnswered ? '다음으로' : `${responses.filter((r) => r !== null).length}/${PANAS_ITEMS.length} 응답 필요`}
          </button>
        </div>

        <div className="progress-indicator">
          <div className="progress-dot completed"></div>
          <div className="progress-dot completed"></div>
          <div className="progress-dot active"></div>
          <div className="progress-dot"></div>
          <div className="progress-dot"></div>
        </div>
      </div>
    </div>
  );
}

export default PANAS;
