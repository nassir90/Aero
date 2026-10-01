import json, os, subprocess, sys

frames, vo_dir, music, out = sys.argv[1:5]
size = sys.argv[5] if len(sys.argv) > 5 else None
info = json.load(open(os.path.join(frames, 'timeline.json')))
dur = info['frames'] / 30
lines = [(seg['start'], os.path.join(vo_dir, seg['vo'] + '.wav')) for seg in info['timeline'] if seg['vo']]

args = ['ffmpeg', '-loglevel', 'error', '-y', '-framerate', '30', '-i', os.path.join(frames, 'f%05d.jpg')]
vf = ['format=yuv420p'] + ([f'scale={size}:flags=lanczos'] if size else [])
if not lines:
    args += ['-vf', ','.join(vf), '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-an', '-movflags', '+faststart', out]
else:
    args += ['-i', music]
    for _, f in lines: args += ['-i', f]
    parts, labels = [], []
    for k, (start, _) in enumerate(lines):
        ms = int((start + .08) * 1000)
        parts.append(f'[{k + 2}:a]aresample=44100,adelay={ms}|{ms},volume=1.15[v{k}]'); labels.append(f'[v{k}]')
    parts.append(''.join(labels) + f'amix=inputs={len(lines)}:normalize=0,apad,atrim=0:{dur:.3f},asplit=2[vo][key]')
    parts.append(f'[1:a]atrim=0:{dur:.3f},asetpts=N/SR/TB,aresample=44100,volume=0.3,afade=t=in:d=0.5,afade=t=out:st={max(0, dur - 1.4):.3f}:d=1.4[mus]')
    parts.append('[mus][key]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=300[duck]')
    parts.append('[vo][duck]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
    args += ['-filter_complex', ';'.join(parts), '-map', '0:v', '-map', '[a]', '-vf', ','.join(vf),
             '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-r', '30', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]
subprocess.run(args, check=True)
print(out, round(dur, 2), 's', os.path.getsize(out) // 1024, 'KB')
