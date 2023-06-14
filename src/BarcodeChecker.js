import { useCallback, useEffect, useState } from "react";
import "./BarcodeChecker.css"

const OK_SOUND_URL = `${process.env.PUBLIC_URL}/ok_sound.mp3`
const NG_SOUND_URL = `${process.env.PUBLIC_URL}/ng_sound.mp3`

function useKeyPressEvent(callback) {
    useEffect(() => {
        if (!window) return;

        window.addEventListener("keypress", callback);
        return () => {
            window.removeEventListener("keypress", callback);
        }
    }, [callback])
}

function useTimer() {
    const setTimer = useCallback((ms, callback) => {
        if (ms && callback) setTimeout(callback, ms)
    }, [])

    return setTimer
}

function useBarcodeReader(callback) {
    const [currentCode, setCurrentCode] = useState("")
    const handler = useCallback((ev) => {
        const digit = ev.key
        console.log(digit)

        if (digit === "Enter") {
            setCurrentCode('')
        }

        if (!digit.match(/\d/)) return;

        if (currentCode.length === 12) {
            const completed = `${currentCode}${digit}`
            callback(completed);
            setCurrentCode('');
        } else {
            setCurrentCode(p => `${p}${digit}`)
        }
        console.log(currentCode)
    }, [callback, currentCode])

    return { handler }
}

function BarcodeChecker() {
    const [firstCode, setFirstCode] = useState("")
    const [secondCode, setSecondCode] = useState("")
    const [okAudio] = useState(new Audio(OK_SOUND_URL))
    const [ngAudio] = useState(new Audio(NG_SOUND_URL))
    const [viewState, setViewState] = useState("normal") // normal | ok | ng
    const setTimer = useTimer()

    useEffect(() => {
        console.log({ firstCode, secondCode })
        if (secondCode === '') return;

        if (firstCode === secondCode) {
            okAudio.play()
            setViewState("ok")
        } else {
            ngAudio.play()
            setViewState("ng")
        }
        setTimer(500, () => {
            setViewState("normal");
            setFirstCode('');
            setSecondCode('');
        })
    }, [firstCode, secondCode, okAudio, ngAudio, setTimer])

    const barcodeReadingCompleted = useCallback((barcode) => {
        if (firstCode === '') {
            setFirstCode(barcode)
        } else {
            setSecondCode(barcode)
        }
    }, [firstCode, setFirstCode, setSecondCode])
    const { handler } = useBarcodeReader(barcodeReadingCompleted)
    useKeyPressEvent(handler)

    const handleReset = useCallback(() => {
        window.location.reload();
    }, [])


    return (
        <div className="App">
            <h1>バーコード確認くん</h1>
            <p>連続で読まれたバーコードが同じかチェックするよ</p>
            <button onClick={() => handleReset()} style={{ width: 300, height: 50 }}>リセット</button>
            {viewState === 'normal' && <div>
                <div>ひとつめ
                    <pre>
                        {firstCode}
                    </pre>
                </div>
                <div>ふたつめ
                    <pre>
                        {secondCode}
                    </pre>
                </div>
            </div>}
            {viewState === 'ok' && <div className="resultSign">✅</div>}
            {viewState === 'ng' && <div className="resultSign">❌</div>}
        </div>
    );
}

export default BarcodeChecker;
