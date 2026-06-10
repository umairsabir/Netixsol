'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Search, User as UserIcon, Menu, X, Star, ChevronLeft, ChevronRight, Heart, Minus, Plus } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import Footer from '@/components/Footer'
import api from '@/lib/api'

const testimonials = [
  { id: 1, name: 'Sarah M.', rating: 5, text: 'I\'m blown away by the quality and style of the clothes I received from Shop.co. From dressy to casual, all the dresses are just *chef\'s kiss* and I can\'t imagine myself wearing anything else.', verified: true },
  { id: 2, name: 'Alex K.', rating: 5, text: 'Finding clothes that align with my personal style used to be difficult until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a wide range of tastes and preferences.', verified: true },
  { id: 3, name: 'James L.', rating: 5, text: 'As someone who\'s always on the hunt for unique fashion pieces, I\'m delighted by the selection Shop.co offers. The quality is outstanding and prices are pretty reasonable considering the design and material used.', verified: true },
]


import Navbar from '@/components/Navbar'

// Brand Logos Component
function BrandLogos() {
  return (
    <>
      <svg width="167" height="34" viewBox="0 0 167 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path fillRule="evenodd" clipRule="evenodd" d="M150.179 0.655656H166.482V3.25336C166.008 3.09436 165.512 3.0124 165.013 3.01061H155.642V15.1491H164.758C165.413 15.1491 165.996 15.0772 166.481 14.9548V17.5411C166.068 17.4443 165.499 17.3952 164.794 17.3952H155.642V29.9466H164.733C165.232 29.9466 165.826 29.874 166.481 29.7159V32.508H150.203C150.333 32.017 150.399 31.511 150.398 31.003V2.19691C150.398 1.56617 150.325 1.04435 150.179 0.655656ZM146.405 8.92219L141.695 8.88659C141.464 6.23976 139.947 3.67765 136.609 3.20567C129.459 2.56211 127.444 10.415 127.626 16.1572C127.809 21.6922 128.694 30.2015 136.075 30.2015C139.171 30.2015 142.144 27.0207 142.047 24.3383L146.405 24.3027C146.089 29.8377 139.741 33.0419 136.718 33.1516C126.389 33.5039 122.066 26.6206 121.848 16.7993C121.654 7.90346 125.296 0 135.504 0C144.244 0.121734 145.931 5.29294 146.405 8.92219ZM72.9408 28.8901L76.0611 26.2803C77.687 28.9635 79.0225 30.1886 82.2517 30.1886C85.5286 30.1886 88.285 28.1982 88.285 24.6786C88.285 22.9423 87.5802 21.522 86.1849 20.4542C85.5528 19.9559 83.951 19.0945 81.4259 17.8928C77.6507 16.0846 73.9731 13.7289 73.9731 8.99551C73.9731 3.02271 79.0467 0.388695 84.3995 0.193636C87.5681 0.0726133 91.5014 1.82174 93.091 3.78728L89.9231 6.22695C89.3581 5.17255 88.5181 4.29083 87.4923 3.6754C86.4665 3.05998 85.2932 2.73381 84.0969 2.73154C80.0541 2.73154 76.8498 7.41724 80.2 10.6464C81.0493 11.4715 82.7863 12.4909 85.4324 13.7047C89.6561 15.6838 93.2612 18.0501 93.2612 23.2825C93.2612 25.0908 92.7878 26.7779 91.853 28.3199C89.9722 31.4273 86.8278 32.9814 82.4339 32.9814C77.3838 32.9814 76.3892 31.8281 72.9408 28.8901ZM28.4893 0.655656H44.7782V3.25336C44.3051 3.09442 43.8094 3.01246 43.3103 3.01061H33.9396V15.1491H43.0554C43.7111 15.1491 44.2941 15.0772 44.7789 14.9548V17.5411C44.366 17.4443 43.7958 17.3952 43.1046 17.3952H33.9396V29.9466H43.0312C43.5289 29.9466 44.124 29.874 44.7789 29.7159V32.508H28.5143C28.6332 32.0151 28.6941 31.5101 28.6958 31.003V2.19691C28.6958 1.56617 28.6225 1.04435 28.4893 0.655656ZM0 0.655656H5.92368V0.947533C5.92368 1.21449 6.0084 1.56617 6.15434 2.01538L14.5049 27.1545L23.0754 1.90574C23.2085 1.48145 23.2818 1.06856 23.2818 0.655656H26.1586C25.8674 1.16537 25.6489 1.61529 25.515 2.01538L15.7308 31.2095C15.6339 31.4886 15.5492 31.9257 15.4766 32.5087H10.6208C10.5474 32.0674 10.4379 31.6329 10.2933 31.2095L0.704065 2.24603C0.482555 1.71187 0.251627 1.18166 0.0113903 0.655656H0ZM62.9145 17.262C66.7986 16.4968 69.7729 13.5232 69.7729 9.27457C69.7729 3.70186 65.1114 0.654944 59.8918 0.654944H50.3509C50.4841 1.14117 50.5574 1.65089 50.5574 2.18481V30.9774C50.5574 31.5968 50.4841 32.1186 50.3509 32.5073H56.0319C55.8929 32.0093 55.8235 31.4944 55.8254 30.9774V17.7476L57.6457 17.9419L67.1631 32.5073H72.8803L62.9145 17.262ZM61.9314 14.8345C60.8998 15.562 59.6611 15.9258 58.2409 15.9258H55.8133V2.97572H57.986C59.8441 2.97572 61.2878 3.43632 62.32 4.35822C63.7282 5.63394 64.4443 7.35744 64.4443 9.51804C64.4443 11.8488 63.6064 13.6214 61.9314 14.8352M120.901 31.1853L110.293 1.71211C110.175 1.37134 110.105 1.01572 110.086 0.655656H105.497C105.497 1.03225 105.436 1.43233 105.29 1.83313L95.0096 31.1853C94.875 31.6089 94.6572 32.0467 94.366 32.508H97.3275C97.3161 32.0225 97.3766 31.5733 97.5105 31.1853L100.556 22.5294H112.27L115.281 31.186C115.439 31.658 115.511 32.0951 115.511 32.508H121.654C121.301 32.0104 121.047 31.5612 120.901 31.1853ZM101.358 20.1865L106.31 5.80266L111.397 20.1865H101.358Z" fill="white" />
      </svg>
      <svg width="91" height="38" viewBox="0 0 91 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path d="M86.3324 36.8604L72.8501 0.0243821L72.841 0H72.5749L69.7985 7.56966L64.7441 21.3504L64.7323 21.3395C62.9806 19.8056 60.5091 18.8468 57.3965 18.4897L56.4472 18.3924L57.389 18.2726C62.5219 17.3573 65.9723 14.1403 65.9723 10.2644C65.9723 4.94948 60.9348 1.2397 53.7189 1.2397H38.7052V1.5088H43.0678V28.9721L32.4727 0.0242918L32.4632 0H32.1971L29.4207 7.56966L18.7123 36.7655L18.6464 36.7731C18.4634 36.7955 18.2824 36.8133 18.1034 36.8268C17.834 36.8477 17.5662 36.8603 17.2976 36.8603H6.47765L27.0448 1.50871L27.1977 1.24304H2.04322V12.1789H2.31013C2.35745 6.85219 5.48348 1.50871 12.3902 1.50871H20.7226L0 37.1251H27.9173V26.6479H27.6504C27.614 31.2906 24.9619 35.7003 19.1947 36.696L19.0114 36.7271L23.4036 24.7469H35.7075L40.141 36.8604H35.7675V37.1252H52.9333V36.8604H48.5411V18.5878H53.6091C58.7665 18.5878 61.7245 20.8743 61.7245 24.859V28.1003C61.7245 28.4575 61.749 28.9796 61.776 29.4163V29.4322L59.052 36.8587H55.4934V37.1235H62.8596V36.8587H59.3393L61.8199 30.0961C61.825 30.1615 61.8276 30.2009 61.8276 30.2009L61.896 30.8103L61.9619 31.2134C62.3758 33.707 63.3369 35.5401 64.8177 36.6616L65.0305 36.815C66.1555 37.5912 67.5535 37.9843 69.1879 37.9843C71.3527 37.9843 72.7962 37.4487 73.988 36.1881L73.8318 36.0422C72.7337 37.048 71.8122 37.4555 70.6576 37.4555C68.6903 37.4555 67.6608 35.0875 67.6608 32.7523V28.2109C67.6712 27.0841 67.4934 25.9634 67.1345 24.8942L67.0856 24.7535V24.7484H76.0851L80.5186 36.862H76.1452V37.1269H91V36.862L86.3324 36.8604ZM23.5015 24.4819L29.5627 7.95697L35.6104 24.4819H23.5015ZM48.5438 18.322V1.50871H52.4122C57.5798 1.50871 60.308 4.5572 60.308 10.3215C60.308 16.452 58.742 18.322 53.6091 18.322H48.5438ZM66.9807 24.4819L66.9545 24.4165C66.5546 23.4499 65.9723 22.568 65.239 21.8181L64.9856 21.5666L64.9586 21.5415L69.937 7.95697L75.9846 24.4819H66.9807Z" fill="white" />
      </svg>
      <svg width="156" height="33" viewBox="0 0 156 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path d="M141.312 9.43605L141.021 9.52824C139.887 7.18474 138.268 5.31921 136.162 3.93163C134.089 2.54403 131.482 1.85022 128.34 1.85022C126.591 1.85022 124.923 2.20481 123.336 2.91399C121.749 3.59242 120.356 4.56374 119.158 5.82795C117.992 7.06135 117.053 8.55686 116.34 10.3145C115.627 12.0721 115.271 14.0147 115.271 16.1424C115.271 18.27 115.627 20.2126 116.34 21.9702C117.053 23.7278 117.992 25.2387 119.158 26.503C120.356 27.7364 121.749 28.6923 123.336 29.3707C124.923 30.049 126.591 30.3882 128.34 30.3882C131.45 30.3882 133.976 29.9257 135.919 29.0006C137.895 28.0448 139.563 26.5955 140.924 24.6529L141.215 24.7451L141.118 27.7053C140.373 28.4453 139.515 29.1083 138.543 29.6941C137.572 30.2492 136.519 30.7271 135.385 31.128C134.284 31.498 133.134 31.7755 131.936 31.9605C130.738 32.1766 129.539 32.2846 128.341 32.2846C125.847 32.2846 123.466 31.8991 121.199 31.1282C118.932 30.3573 116.94 29.2781 115.223 27.8905C113.506 26.4721 112.146 24.7762 111.142 22.8027C110.138 20.7985 109.636 18.5783 109.636 16.1423C109.636 13.7063 110.138 11.5016 111.142 9.5282C112.146 7.52386 113.506 5.8125 115.223 4.39412C116.94 2.97568 118.932 1.89644 121.199 1.15639C123.466 0.385491 125.847 3.98854e-05 128.341 3.98854e-05C129.539 3.98854e-05 130.738 0.0925452 131.936 0.277556C133.134 0.462566 134.284 0.755512 135.385 1.15639C136.519 1.52642 137.572 2.00437 138.543 2.59027C139.515 3.1453 140.373 3.79283 141.118 4.53287L141.312 9.43605ZM34.252 18.2704C33.8959 18.4244 33.5558 18.6249 33.2317 18.872C32.9076 19.1185 32.7456 19.4577 32.7456 19.8896V25.5786C31.1909 27.7063 29.199 29.356 26.7698 30.5277C24.3406 31.6995 21.6523 32.2854 18.7048 32.2854C16.2108 32.2854 13.8302 31.8999 11.563 31.129C9.29573 30.3581 7.30378 29.2789 5.58713 27.8913C3.87051 26.4729 2.51014 24.777 1.50605 22.8035C0.502017 20.7993 0 18.5791 0 16.1431C0 13.7071 0.502017 11.5024 1.50605 9.52895C2.51014 7.52462 3.87051 5.81326 5.58713 4.39488C7.30378 2.97644 9.29573 1.89721 11.563 1.15719C13.8302 0.386263 16.2108 0.000798165 18.7048 0.000798165C19.9032 0.000798165 21.1016 0.0933033 22.3001 0.278314C23.4984 0.463324 24.6483 0.756271 25.7495 1.15715C26.8831 1.52717 27.9358 2.00513 28.9075 2.59102C29.8791 3.14605 30.7375 3.79359 31.4825 4.53363L31.6771 9.43641L31.3856 9.52859C30.252 7.18508 28.6325 5.31953 26.5272 3.93195C24.4543 2.54435 21.8469 1.85054 18.7052 1.85054C16.9561 1.85054 15.2881 2.20515 13.7011 2.91435C12.114 3.59275 10.7212 4.56406 9.52279 5.82827C8.35675 7.0617 7.41748 8.55722 6.70498 10.3148C5.99236 12.0724 5.63605 14.0151 5.63605 16.1427C5.63605 18.2395 5.97615 20.1667 6.65635 21.9243C7.36894 23.6819 8.30824 25.1928 9.47425 26.4571C10.6726 27.6905 12.0654 28.6618 13.6524 29.371C15.2395 30.0494 16.9238 30.3886 18.7052 30.3886C22.0737 30.3886 24.9563 29.7719 27.3531 28.5385V19.8892C27.3531 19.4577 27.1751 19.1185 26.819 18.8716C26.4949 18.6251 26.171 18.4246 25.8473 18.27L25.8917 18.039C26.0534 18.0672 26.345 18.098 26.7662 18.1312C27.1875 18.1594 27.6248 18.1902 28.078 18.2234H32.2565C32.6451 18.1952 33.0176 18.1645 33.3739 18.1312C33.73 18.103 34.0052 18.0723 34.1996 18.039L34.252 18.2704ZM69.442 0.971783C69.1179 1.12577 68.794 1.32629 68.4703 1.57335C68.1462 1.81984 67.9682 2.28237 67.9362 2.96092C67.9066 3.70097 67.8743 4.64145 67.8393 5.78237C67.8393 6.89246 67.8245 8.15669 67.7949 9.57505C67.7949 10.9935 67.7801 12.5353 67.7505 14.2004V19.3808C67.7208 21.385 67.4616 23.0964 66.9728 24.5148C66.487 25.9332 65.8392 27.1203 65.0295 28.0762C64.2522 29.0322 63.3777 29.7876 62.406 30.3427C61.4666 30.8977 60.5273 31.314 59.5881 31.5915C58.6811 31.9 57.8228 32.085 57.0132 32.1465C56.2034 32.239 55.5718 32.2853 55.1184 32.2853C53.2722 32.2853 51.4907 32.054 49.7741 31.5915C48.0574 31.16 46.5513 30.4508 45.2558 29.4638C43.9602 28.4771 42.9238 27.1974 42.1465 25.6249C41.3691 24.0523 40.9804 22.1405 40.9804 19.8895V14.663V9.85256C40.9804 8.37245 40.9656 7.04655 40.936 5.87484C40.936 4.67224 40.9212 3.70093 40.8915 2.96088C40.8619 2.28249 40.6839 1.81996 40.3574 1.57331C40.0333 1.32681 39.7094 1.12629 39.3857 0.971744L39.4302 0.74076C39.5919 0.768961 39.8512 0.79969 40.2078 0.832946C40.5965 0.861147 40.9852 0.891876 41.3739 0.925132C41.7951 0.925132 42.2 0.939232 42.5885 0.967434H44.3375C44.7262 0.939232 45.131 0.925132 45.5521 0.925132C45.9733 0.896931 46.362 0.866202 46.7181 0.832946C47.1067 0.804745 47.3819 0.774016 47.5437 0.74076L47.5881 0.971744C47.232 1.12573 46.892 1.32625 46.5679 1.57331C46.2764 1.8198 46.1143 2.28233 46.0817 2.96088C46.0521 3.70093 46.0198 4.67224 45.9849 5.87484V19.8895C45.9849 23.2505 46.8108 25.7327 48.4626 27.3362C50.1145 28.9396 52.5599 29.7413 55.7989 29.7413C56.7381 29.7413 57.807 29.6333 59.0054 29.4173C60.2039 29.1708 61.3213 28.6774 62.3577 27.9372C63.4266 27.1971 64.3173 26.1488 65.0299 24.792C65.7748 23.4352 66.1473 21.6314 66.1473 19.3804C66.1473 16.9444 66.1325 14.8631 66.1029 13.1363C66.1029 11.3787 66.088 9.88319 66.0584 8.64976C66.0584 7.38552 66.0436 6.30628 66.014 5.41203C65.9844 4.51784 65.9521 3.70071 65.9171 2.96065C65.8874 2.28225 65.7094 1.81972 65.3829 1.57307C65.0588 1.32657 64.735 1.12604 64.4113 0.971464L64.4557 0.740521C64.8118 0.801978 65.2167 0.863741 65.6703 0.92581C66.1235 0.954011 66.5446 0.968112 66.9335 0.968112C67.2896 0.968112 67.6945 0.954011 68.1481 0.92581C68.6339 0.864353 69.055 0.80259 69.4113 0.740521L69.442 0.971783ZM104.696 9.43605L104.405 9.52824C103.271 7.18474 101.652 5.31921 99.5462 3.93163C97.4733 2.54403 94.8659 1.85022 91.7242 1.85022C89.9752 1.85022 88.3071 2.20481 86.72 2.91399C85.1329 3.59242 83.7402 4.56374 82.5418 5.82795C81.3758 7.06135 80.4365 8.55686 79.7239 10.3145C79.0114 12.0721 78.6551 14.0148 78.6551 16.1424C78.6551 18.27 79.0114 20.2126 79.7239 21.9702C80.4366 23.7278 81.3759 25.2387 82.5418 26.503C83.7402 27.7364 85.1329 28.6923 86.72 29.3707C88.3071 30.049 89.9752 30.3882 91.7243 30.3882C94.8336 30.3882 97.36 29.9257 99.3034 29.0006C101.279 28.0448 102.947 26.5955 104.307 24.6529L104.599 24.7451L104.502 27.7053C103.757 28.4453 102.899 29.1083 101.927 29.6941C100.955 30.2491 99.9027 30.7271 98.7691 31.128C97.6679 31.498 96.5181 31.7755 95.3196 31.9605C94.1212 32.1765 92.9228 32.2846 91.7245 32.2846C89.2304 32.2846 86.8498 31.8991 84.5826 31.1282C82.3153 30.3573 80.3234 29.2781 78.6068 27.8905C76.8901 26.4721 75.5297 24.7762 74.5257 22.8027C73.5216 20.7984 73.0196 18.5783 73.0196 16.1423C73.0196 13.7063 73.5216 11.5016 74.5257 9.52816C75.5297 7.52382 76.8901 5.81246 78.6068 4.39408C80.3234 2.97564 82.3153 1.8964 84.5826 1.15635C86.8499 0.385452 89.2305 0 91.7245 0C92.9228 0 94.1212 0.0925053 95.3197 0.277516C96.5181 0.462526 97.6679 0.755472 98.7691 1.15635C99.9027 1.52638 100.955 2.00433 101.927 2.59023C102.899 3.14526 103.757 3.79279 104.502 4.53283L104.696 9.43605ZM155.956 31.4987C155.794 31.4705 155.519 31.4397 155.13 31.4065C154.774 31.4065 154.385 31.3924 153.964 31.3642C153.543 31.3642 153.138 31.3501 152.749 31.3219H149.835C149.446 31.3501 149.057 31.3808 148.669 31.4141C148.312 31.4423 148.037 31.473 147.843 31.5062L147.798 31.3209C148.122 31.1669 148.446 30.9664 148.77 30.7193C149.094 30.4729 149.272 30.0103 149.304 29.3318C149.334 28.5917 149.349 27.8209 149.349 27.0191C149.378 26.2174 149.393 25.3077 149.393 24.2902V20.8212V16.1497V11.4782V7.96295C149.393 6.94539 149.378 6.05116 149.349 5.28026C149.349 4.47855 149.334 3.70767 149.304 2.96763C149.275 2.28923 149.097 1.82671 148.77 1.58005C148.446 1.30254 148.122 1.08677 147.798 0.932754L147.843 0.747504C148.037 0.808962 148.312 0.855214 148.669 0.886262C149.057 0.886262 149.446 0.900363 149.835 0.928564C150.256 0.956765 150.661 0.970866 151.049 0.970866H152.749C153.138 0.942665 153.543 0.928564 153.964 0.928564C154.385 0.900363 154.774 0.869634 155.13 0.836378C155.519 0.808177 155.794 0.777448 155.956 0.744192L156 0.929522C155.644 1.08351 155.304 1.29926 154.98 1.57678C154.688 1.82327 154.526 2.2858 154.494 2.96436C154.464 3.7044 154.432 4.47527 154.397 5.27699V27.0159C154.426 27.8176 154.459 28.5885 154.494 29.3285C154.523 30.0069 154.685 30.4694 154.98 30.7161C155.304 30.9626 155.644 31.1631 156 31.3176L155.956 31.4987Z" fill="white" />
      </svg>
      <svg width="194" height="32" viewBox="0 0 194 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 0.90175L2.93217 4.20848V28.4106L0.758974 31.5774L14.0684 31.5978L11.6695 28.6839L11.4204 19.9679L24.2536 20.0375C28.1434 18.7425 32.1421 15.9815 32.3342 10.3996C32.2728 4.99032 28.9703 1.52086 25.136 0.830605L0 0.90175ZM10.9449 2.44953V17.9977L20.7911 18.0689C23.0315 16.2623 24.7298 14.8787 24.6619 10.5411C24.6298 7.00433 23.8832 3.92011 20.5873 2.45029L10.9449 2.44953ZM38.4936 0.725402L41.4258 4.03289V28.2351L39.2526 31.4033L52.5613 31.4222L50.1624 28.5083L49.9133 19.7923H49.9666L63.7165 31.5206L75.1274 31.4275L64.7129 22.4193H56.0187L52.9543 19.8089L62.7465 19.8619C66.6363 18.5669 70.6342 15.8059 70.8271 10.224C70.7665 4.81548 67.4639 1.34527 63.6289 0.65577L38.4936 0.725402ZM49.4378 2.27318V17.8214L59.284 17.8925C61.5251 16.0859 63.2227 14.7024 63.1548 10.364C63.1227 6.82798 62.3761 3.74301 59.0802 2.27318H49.4378ZM86.1132 0.690586H97.5891L112.528 28.4106C113.174 30.551 115.108 30.2869 116.398 31.2254H101.935L104.108 30.5457L103.972 28.4818L100.237 22.5011L87.5391 22.5722L84.8232 28.3418C84.7326 28.998 84.0306 29.496 84.5514 30.3111L85.5705 31.2958L79.3234 31.155L82.04 30.3111L92.2924 8.71181V7.23365L87.9606 1.45502L86.1132 0.690586ZM88.3419 20.5976L93.616 10.6123L99.1071 20.5416L88.3419 20.5976ZM163.715 0.751135H175.19L190.129 28.4712C190.776 30.6116 192.709 30.3475 194 31.286H179.536L181.709 30.6048L181.573 28.5408L177.839 22.5616L165.141 22.6328L162.425 28.4008C162.333 29.0585 161.632 29.5565 162.152 30.3717L163.171 31.3563L156.925 31.2156L159.642 30.3717L169.894 8.77235V7.29345L165.562 1.51557L163.715 0.751135ZM165.944 20.6589L171.218 10.6736L176.709 20.6013L165.944 20.6589ZM120.367 0.402222L140.81 0.514994C147.394 2.05672 151.582 6.07868 152.881 13.0948L152.826 18.5669C151.626 24.8186 147.693 29.1319 140.756 31.3155L120.258 31.373L120.255 30.7107C123.372 30.4754 123.621 30.1196 123.629 28.2699V3.33506C123.594 1.96741 123.32 1.11594 120.312 1.02209L120.367 0.402222ZM131.988 2.53581L131.968 29.5134C134.664 29.5225 137.003 29.7753 138.325 29.1009C141.319 27.7333 142.71 25.633 142.837 23.6598L142.765 7.73016C142.766 5.1818 140 3.38274 138.404 2.91425C137.262 2.49116 134.983 2.47375 131.988 2.53581Z" fill="white" stroke="white" strokeWidth="1.02419" strokeMiterlimit="2.613" />
      </svg>
      <svg width="207" height="34" viewBox="0 0 207 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path fillRule="evenodd" clipRule="evenodd" d="M16.6481 30.4522C9.40945 30.4522 3.2308 23.8867 3.2308 16.7255C3.2308 9.59072 9.28013 2.89479 16.5961 2.89479C21.4053 2.89479 24.8682 5.22146 27.6867 8.86674H31.2281C30.1681 6.95346 29.0308 5.19603 27.2988 3.82545C24.3255 1.42142 20.4735 0 16.6481 0C7.47074 0 0 7.57464 0 16.7C0 25.8508 7.57464 33.3481 16.7 33.3481C20.4227 33.3481 24.068 31.9786 26.9893 29.6774C28.8252 28.204 30.1173 26.2907 31.3586 24.3255H27.8172C25.0241 27.9708 21.4573 30.4522 16.6481 30.4522ZM53.3574 13.0028C51.1346 10.1334 48.1094 8.32404 44.3614 8.32404C37.64 8.32404 32.108 13.7798 32.108 20.5012C32.108 27.2214 37.6665 32.728 44.3614 32.728C48.2653 32.728 50.9788 31.0988 53.3574 28.1001V32.1842H56.2787V8.89216H53.3574V13.0028ZM44.2066 30.0388C39.0614 30.0388 35.0027 25.5668 35.0027 20.5266C35.0027 15.5107 39.036 11.0132 44.2066 11.0132C49.3507 11.0132 53.3574 15.5118 53.3574 20.5266C53.3574 25.5668 49.3242 30.0388 44.2066 30.0388ZM59.8201 32.1842H62.9492V0.670921H59.8201V32.1842ZM74.7627 28.487L66.8521 8.89216H63.7495L73.2374 32.1842H76.3908L85.8533 8.89216H82.8027L74.7627 28.487ZM87.1454 32.1842H90.2734V8.89216H87.1454V32.1842ZM87.1454 5.89348H90.2734V0.670921H87.1454V5.89348ZM103.743 8.32293C100.795 8.32293 98.7014 9.87478 96.7627 11.9428V8.89216H93.8668V32.1842H96.9428V17.991C96.9174 14.2429 100.019 11.0121 103.794 11.0121C108.523 11.0121 110.902 15.1228 110.902 19.3627V32.1853H113.797V19.3627C113.798 13.3134 110.257 8.32293 103.743 8.32293ZM142.829 0.670921L128.611 18.7415V0.670921H125.535V32.1842H128.611V23.5242L132.644 18.5094L142.907 32.1842H146.812L134.608 16.0269L146.812 0.670921H142.829ZM147.948 32.1842H151V0.670921H147.948V32.1842ZM176.256 14.7602C174.136 10.8043 169.896 8.32293 165.423 8.32293C158.755 8.32293 153.118 13.8815 153.118 20.5509C153.118 27.2711 158.806 32.7269 165.477 32.7269C168.655 32.7269 171.785 31.4602 174.084 29.2629C175.481 27.9443 176.308 26.2896 177.056 24.5576H173.775C172.119 27.7895 169.198 30.0377 165.422 30.0377C163.123 30.0377 160.874 29.107 159.168 27.5298C157.408 25.9282 156.634 23.9619 156.297 21.6363H177.781C177.783 19.2068 177.445 16.8802 176.256 14.7602ZM156.402 18.9482C157.334 14.5801 160.771 11.0121 165.477 11.0121C169.432 11.0121 173.672 13.4427 174.603 18.9482H156.402ZM180.057 32.1842H183.132V8.89216H180.057V32.1842ZM180.057 5.99738H183.132V0.670921H180.057V5.99738ZM196.654 8.32293C193.654 8.32293 191.56 9.87478 189.595 11.9428V8.89216H186.648V32.1842H189.751V17.991C189.725 14.2175 192.905 11.0121 196.704 11.0121C201.411 11.0121 203.893 15.1228 203.893 19.3627V32.1853H206.788V19.3627C206.788 13.3134 203.193 8.32293 196.654 8.32293Z" fill="white" />
      </svg>
    </>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="bg-[#F2F0F1] from-gray-100 to-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h2
            className="text-4xl md:text-[64px] font-integral font-extrabold leading-tight md:leading-[64px] mb-4 lg:mb-8 uppercase tracking-normal"
            style={{
              fontStyle: 'bold', // Bold is usually handled by weight 700
              verticalAlign: 'middle',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h2>
          <p className="text-gray-600 mb-8 text-sm md:text-[16px] leading-[22px] max-w-lg font-normal tracking-normal">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>
          <Link href="/shop" className="inline-block text-center w-full md:w-auto bg-black text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors border border-black hover:shadow-lg">
            Shop Now
          </Link>

          {/* Stats */}
          <div className="grid grid-cols-2 px-10 md:px-0 place-items-center md:place-items-start md:grid-cols-3 gap-4 mt-12">
            <div>
              <p className="text-2xl md:text-3xl font-bold">200+</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">International Brands</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold">2,000+</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">High-Quality Products</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-2xl md:text-3xl font-bold text-center md:text-left">30,000+</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1 text-center md:text-left">Happy Customers</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-lg h-full max-h-[663px] flex items-center justify-center relative overflow-hidden">
            <img src="/hero-image.webp" alt="Hero" className="w-full h-full object-cover object-top max-h-[663px] rounded-lg" />
          </div>
        </div>
      </div>

      {/* Brands Section */}
      <div className="bg-black text-white py-10 mt-0 overflow-hidden border-y border-white/10 shadow-2xl relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Marquee (< md) */}
          <div className="lg:hidden">
            <div className="animate-marquee gap-12 flex items-center pr-12">
              <BrandLogos />
            </div>
          </div>

          {/* Desktop Flex (>= md) */}
          <div className="hidden lg:flex flex-wrap justify-between items-center gap-12 px-4">
            <BrandLogos />
          </div>
        </div>
      </div>
    </section>
  )
}

// Product Card Component
function ProductCard({ product }: { product: any }) {
  const currentPrice = product.discountedPrice !== undefined && product.discountedPrice !== null ? product.discountedPrice : product.price
  const originalPrice = product.discountedPrice !== null && product.discountedPrice !== undefined ? product.price : null
  const discount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative bg-gray-100 rounded-[20px] overflow-hidden mb-4 aspect-square">
        <img
          src={product.images?.[0] || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B7cx8j1qm1miEAwmA1LFoYsfygcXxY.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium border border-red-400 shadow-sm">
            -{discount}%
          </div>
        )}
      </div>
      <h3 className="font-bold text-sm md:text-base mb-1 truncate text-gray-900 group-hover:underline">{product.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-100'}`} />
          ))}
        </div>
        <span className="text-[11px] text-gray-500 font-medium">{product.rating?.toFixed(1) || "5.0"}/5</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg md:text-xl text-gray-900">${currentPrice}</span>
        {originalPrice && (
          <span className="text-sm md:text-base text-gray-400 font-bold line-through">${originalPrice}</span>
        )}
      </div>
    </Link>
  )
}

// Products Section
function ProductsSection({ title, productsList, viewAllHref = "/shop" }: { title: string, productsList: any[], viewAllHref?: string }) {
  if (!productsList || productsList.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 uppercase tracking-tight font-integral">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productsList.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Link href={viewAllHref} className="px-16 py-3 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-900">
            View All
          </Link>
        </div>
      </div>
    </section>
  )
}

// Browse By Style / Category
function BrowseByCategory({ categories }: { categories: any[] }) {
  if (!categories || categories.length === 0) return null;

  // Grid span logic: [small, large, large, small]
  const getGridStyles = (index: number) => {
    switch (index % 4) {
      case 0: return 'md:col-span-1'; // Casual slot
      case 1: return 'md:col-span-2'; // Formal slot
      case 2: return 'md:col-span-2'; // Party slot
      case 3: return 'md:col-span-1'; // Gym slot
      default: return 'md:col-span-1';
    }
  };

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto bg-[#F0F0F0] rounded-[40px] px-4 md:px-16 py-12 md:py-20">
        <h2 className="text-3xl md:text-[48px] font-bold text-center mb-10 md:mb-16 uppercase font-integral leading-tight text-black">
          BROWSE BY CATEGORIES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {categories.slice(0, 4).map((category, idx) => (
            <Link
              href={`/shop?category=${category._id}`}
              key={category._id}
              className={`group relative h-[190px] md:h-[289px] rounded-[20px] overflow-hidden cursor-pointer bg-white ${getGridStyles(idx)}`}
            >
              <div className="absolute inset-0 bg-gray-100/50">
                <img
                  src={category.imageUrl || category.image || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B7cx8j1qm1miEAwmA1LFoYsfygcXxY.png'}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B7cx8j1qm1miEAwmA1LFoYsfygcXxY.png'
                  }}
                />
              </div>
              <div className="absolute top-6 left-6 md:top-9 md:left-9 z-10">
                <h3 className="text-2xl md:text-[36px] font-bold text-black font-sans capitalize leading-none">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials
function Testimonials() {
  const [currentIdx, setCurrentIdx] = useState(0)

  return (
    <section className="py-12 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight font-integral" >OUR HAPPY CUSTOMERS</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIdx(Math.min(testimonials.length - 1, currentIdx + 1))}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-3">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="border border-gray-200 rounded-[20px] p-6 w-80 md:w-auto">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-lg">{testimonial.name}</span>
                  {testimonial.verified && (
                    <div className="bg-green-500 rounded-full p-0.5">
                      <Star className="w-3 h-3 fill-white text-white" />
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-[15px] leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Newsletter Section
function NewsletterSection() {
  return (
    <section className="bg-white px-4 relative z-10 -mb-20">
      <div className="max-w-7xl mx-auto bg-black text-white rounded-[40px] py-10 md:py-16 px-8 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="flex-1 max-w-xl">
          <h2 className="text-3xl md:text-5xl font-integral font-extrabold leading-tight uppercase tracking-tighter">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h2>
        </div>
        <div className="flex-1 flex flex-col gap-4 max-w-sm w-full">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center">
              <Star className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-white text-black pl-11 pr-4 py-3.5 rounded-full outline-none text-sm w-full font-medium"
            />
          </div>
          <button className="bg-white text-black font-medium py-3.5 rounded-full hover:bg-gray-100 transition-colors text-sm">
            Subscribe to Newsletter
          </button>
        </div>
      </div>
    </section>
  )
}

// Main Page
export default function ShoppingPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ])
        setProducts(prodRes.data.products || [])
        setCategories(catRes.data || [])
      } catch (err) {
        console.error('Error fetching home data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      {loading ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : (
        <>
          <HeroSection />
          <ProductsSection
            title="NEW ARRIVALS"
            productsList={products.slice(0, 4)}
            viewAllHref="/shop?sort=newest"
          />
          <div className="max-w-7xl mx-auto px-4"><hr className="border-gray-200" /></div>
          <ProductsSection
            title="TOP SELLING"
            productsList={products.filter(p => true).slice(4, 8)}
            viewAllHref="/shop?sort=most-popular"
          />
          <BrowseByCategory categories={categories} />
          <Testimonials />
          <NewsletterSection />
        </>
      )}
      <div className="pt-24 bg-[#F0F0F0]">
        <Footer />
      </div>
    </main>
  )
}
