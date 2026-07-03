import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
// 오픈소스 폰트 셀프호스팅 (외부 네트워크 요청 없음)
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles/fonts.css';
import './styles/global.css';
import './styles/os.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
