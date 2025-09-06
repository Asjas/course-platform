# Setting Up TensorFlow with GPU Support on Rocky Linux 10 in WSL 2

This guide walks through setting up TensorFlow with GPU support on Rocky Linux
10 running in Windows Subsystem for Linux (WSL) 2. This blog post assumes you've
already installed Rocky Linux on WSL 2 using the
[official Rocky Linux WSL 2 install guide](https://docs.rockylinux.org/guides/interoperability/import_rocky_to_wsl/?h=wsl#import-rocky-linux-to-wsl).

We'll verify NUMA support, install necessary system packages, install `Python`
with [uv](https://docs.astral.sh/uv/), install `Miniforge3` for environment
management, and configure the `NVIDIA CUDA Toolkit` for GPU acceleration.

## Update WSL 2 and verify WSL Kernel NUMA Support

The default WSL 2 version (especially on Windows 10) ships with an older version
of WSL 2 as well as an older version of the Linux kernel. So first things first,
let's update `wsl`.

Open your `cmd prompt` or `powershell` and run the following command to update
WSL 2.

```ps
wsl --update
```

After updating `wsl` my `cmd prompt` output shows the following when I run
`wsl --version`.

```ps
WSL version: 2.5.10.0
Kernel version: 6.6.87.2-1
WSLg version: 1.0.66
MSRDC version: 1.2.6074
Direct3D version: 1.611.1-81528511
DXCore version: 10.0.26100.1-240331-1435.ge-release
Windows version: 10.0.19045.6216
```

Yours may be on an even newer version, the point of this process is just make
sure that `wsl` is on it's newest version. I would recommend running this
command periodically to keep `wsl` updated through Task Scheduler.

Now close your `cmd prompt` or `powershell` and open your WSL Rocky Linux
instance.

## Install System Dependencies for Rocky Linux

To prepare Rocky Linux for `TensorFlow` and `CUDA`, install required development
tools and libraries. These enable building software, installing drivers, and
supporting additional repositories like EPEL.

```bash
sudo dnf upgrade --refresh -y
sudo dnf config-manager --set-enabled crb
sudo dnf install epel-release -y
sudo dnf groupinstall "Development Tools" -y
sudo dnf install tar bzip2 make automake gcc gcc-c++ pciutils elfutils-libelf-devel libglvnd-opengl libglvnd-glx libglvnd-devel acpid pkgconfig -y
```

> **Note**: The `sudo dnf config-manager --set-enabled crb` command enables the
> **CodeReady Builder (CRB)** repository, which provides additional development
> tools, libraries, and dependencies not in the standard BaseOS or AppStream
> repositories. Similar to the "PowerTools" repo in CentOS/RHEL 8, CRB is
> disabled by default on Rocky Linux 9/10 for security and stability, so enable
> it only when needed.

## Install Python with uv

For precise control over Python versions, use `uv` instead of `dnf`. The `dnf`
method installs the latest Python version, which may auto-update and break
TensorFlow compatibility. `uv` allows installing specific versions, which is
critical since TensorFlow 2.20.0 officially supports Python 3.9 – 3.12 (although
it worked for me with 3.13.5 in testing, I would recommend 3.12 for stability).

### Install uv

Use the official uv installer:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Shell autocompletion

This sets up `uv` and `uvx` autocompletions in your shell. If you are using
something other than `zsh` then you can follow the
[official documentation to set up autocompletions](https://docs.astral.sh/uv/getting-started/installation/#shell-autocompletion)
for your shell.

```bash
echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc
echo 'eval "$(uvx --generate-shell-completion zsh)"' >> ~/.zshrc
```

### Install Python 3.12

Use this command to install python 3.12.

```bash
uv python install 3.12
```

Replace `3.12.11` with your installed version.

```bash
uv python pin 3.12.11
```

Verify that the correct Python version is now available:

```bash
python --version
```

**Expected Output**:

```bash
Python 3.12.11
```

### Python linter and code formatter

If you want an updated linter and code formatter for your Python code you can
install and use [ruff](https://docs.astral.sh/ruff/).

```bash
uv tool install ruff
```

You can then use the following command to check/fix your code:

```bash
ruff check
ruff check --fix
```

You can use the following command to format your code:

```bash
ruff format
```

### Debug uv Installation

If a previous installation of Mamba/Conda is already active it could interfere
with your `uv` installation, deactivate and reload the shell:

```bash
mamba deactivate
exec zsh
uv python install 3.12
```

### Alternative: Install Python with dnf

If you prefer not to use `uv`, install Python via DNF, but note it may update
automatically during `dnf upgrade`, potentially breaking TensorFlow
compatibility:

```bash
sudo dnf install python pip -y
pip install --upgrade pip
```

Verify versions:

```bash
python --version
pip --version
```

## Install Miniforge3

Miniforge3 is a minimal installer for Conda/Mamba, tailored for the conda-forge
channel. It provides a lightweight way to manage Python environments without
Anaconda's bloat. Unlike Miniconda, Miniforge3 avoids commercial channels,
prioritizing open-source packages, making it ideal for machine learning setups
like TensorFlow.

Install Miniforge3:

```bash
curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
bash Miniforge3-$(uname)-$(uname -m).sh
```

- Press Enter to scroll through the license agreement.
- Select "yes" at the prompt.
- Confirm the default installation location (e.g.,
  `/home/<your-username>/miniforge3`) by pressing Enter.
- When prompted to initialize Conda on shell startup, type `yes` to enable
  auto-activation of Mamba/Conda. If you choose `no`, manually activate with
  `mamba activate tf-gpu` before running TensorFlow scripts.

**Example Output (zsh)**:

```bash
# This is an example of me running the script
Running `shell init`, which:
 - modifies RC file: "/home/asjas/.zshrc"
 - generates config for root prefix: "/home/asjas/miniforge3"
 - sets mamba executable to: "/home/asjas/miniforge3/bin/mamba"
The following has been added in your "/home/asjas/.zshrc" file
# >>> mamba initialize >>>
# !! Contents within this block are managed by 'mamba shell init' !!
export MAMBA_EXE='/home/asjas/miniforge3/bin/mamba';
export MAMBA_ROOT_PREFIX='/home/asjas/miniforge3';
__mamba_setup="$("$MAMBA_EXE" shell hook --shell zsh --root-prefix "$MAMBA_ROOT_PREFIX" 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__mamba_setup"
else
    alias mamba="$MAMBA_EXE"
fi
unset __mamba_setup
# <<< mamba initialize <<<
Thank you for installing Miniforge3!
```

Verify Mamba/Conda in `~/.zshrc`:

```bash
cat ~/.zshrc
```

Ensure the following is present (added by Miniforge3):

```bash
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/home/<your-username>/miniforge3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/home/<your-username>/miniforge3/etc/profile.d/conda.sh" ]; then
        . "/home/<your-username>/miniforge3/etc/profile.d/conda.sh"
    else
        export PATH="/home/<your-username>/miniforge3/bin:$PATH"
    fi
fi
unset __conda_setup
# >>> mamba initialize >>>
# !! Contents within this block are managed by 'mamba shell init' !!
export MAMBA_EXE='/home/<your-username>/miniforge3/bin/mamba';
export MAMBA_ROOT_PREFIX='/home/<your-username>/miniforge3';
__mamba_setup="$("$MAMBA_EXE" shell hook --shell zsh --root-prefix "$MAMBA_ROOT_PREFIX" 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__mamba_setup"
else
    alias mamba="$MAMBA_EXE"
fi
unset __mamba_setup
# <<< mamba initialize <<<
```

Add the following to `~/.zshrc` if not present:

```bash
eval "$(mamba shell hook --shell zsh)"
```

Reload the shell:

```bash
source ~/.zshrc
```

Verify Mamba is accessible:

```bash
mamba --version
```

Check conda-forge channel:

```bash
mamba config list
```

**Expected**: Should show only `channels: ['conda-forge']`.

Create the TensorFlow environment with Python 3.12 (recommended for official
TensorFlow support):

```bash
mamba create -n tf-gpu python=3.12 -c conda-forge -y
```

> **Note**: TensorFlow 2.20.0 officially supports Python 3.9 – 3.12. It has been
> tested successfully with 3.13.5, but I recommend using Python 3.12.x for
> stability.

## Install TensorFlow with GPU Support

Activate the environment:

```bash
mamba activate tf-gpu
```

Install TensorFlow 2.20.0 with CUDA support:

For zsh:

```bash
pip install "tensorflow[and-cuda]==2.20.0"
```

For bash (if needed):

```bash
pip install tensorflow[and-cuda]==2.20.0
```

Verify installed packages:

```bash
pip list | grep -E 'tensorflow|nvidia'
```

**Example Output**:

```bash
nvidia-cublas-cu12       12.9.1.4
nvidia-cuda-cupti-cu12   12.9.79
nvidia-cuda-nvcc-cu12    12.9.86
nvidia-cuda-nvrtc-cu12   12.9.86
nvidia-cuda-runtime-cu12 12.9.79
nvidia-cudnn-cu12        9.12.0.46
nvidia-cufft-cu12        11.4.1.4
nvidia-curand-cu12       10.3.10.19
nvidia-cusolver-cu12     11.7.5.82
nvidia-cusparse-cu12     12.5.10.65
nvidia-nccl-cu12         2.27.7
nvidia-nvjitlink-cu12    12.9.86
tensorflow               2.20.0
```

## Test TensorFlow GPU Setup

Always activate the environment before running TensorFlow scripts:

```bash
mamba activate tf-gpu
```

Run these commands directly in your terminal to verify TensorFlow and GPU
detection:

```bash
python -c "import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices('GPU'))"
python -c "import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices('GPU')); print('cuDNN enabled:' if tf.test.is_built_with_cuda() else 'cuDNN not enabled')"
```

### Verbose GPU and Tensorflow verification

If you don't get the correct output in the terminal or you want more verbose
details you can create the following script and run it.

```bash
vi test_tensorflow_gpu.py
```

Add the following content:

```python
import tensorflow as tf
import importlib.metadata

def get_package_version(package_name):
    try:
        return importlib.metadata.version(package_name)
    except importlib.metadata.PackageNotFoundError:
        return "Not installed"

# Print TensorFlow version and GPU devices
print(f"TensorFlow version: {tf.__version__}")
print(f"Physical devices: {tf.config.list_physical_devices('GPU')}")

# Get CUDA and cuDNN versions from pip packages
cuda_version = get_package_version("nvidia-cuda-runtime-cu12")
cudnn_version = get_package_version("nvidia-cudnn-cu12")
print(f"CUDA version (from pip): {cuda_version}")
print(f"cuDNN version (from pip): {cudnn_version}")

# Simple GPU computation test
with tf.device('/GPU:0'):
    a = tf.random.normal([1000, 1000])
    b = tf.random.normal([1000, 1000])
    c = tf.matmul(a, b)
    print("GPU computation result (sum of matrix product):", tf.reduce_sum(c).numpy())

# Check compute capability
if tf.config.list_physical_devices('GPU'):
    gpu = tf.config.list_physical_devices('GPU')[0]
    print(f"GPU details: {gpu}")

```

Run the script:

```sh
python test_tensorflow_gpu.py
```

You should see similar output to this:

```bash
TensorFlow version: 2.20.0
Physical devices: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
CUDA version (from pip): 12.9.79
cuDNN version (from pip): 9.12.0.46
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
I0000 00:00:1756553638.111949   64294 gpu_device.cc:2020] Created device /job:localhost/replica:0/task:0/device:GPU:0 with 6100 MB memory:  -> device: 0, name: NVIDIA GeForce RTX 2060 SUPER, pci bus id: 0000:29:00.0, compute capability: 7.5
GPU computation result (sum of matrix product): -50209.42
GPU details: PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')
```

### Test a basic Tensorflow model

Here we will test a basic Tensorflow model to confirm that the GPU is being used
for model training.

Create a test script (`test_gpu.py`):

```bash
vi test_gpu.py
```

Add this content:

```python
import tensorflow as tf
import time

# Load MNIST data

mnist = tf.keras.datasets.mnist (x*train, y_train), * = mnist.load_data()
x_train = (x_train[:5000] / 255.0).astype('float32') # Normalize and cast to
float32 y_train = y_train[:5000]

# Simple CNN model (uses cuDNN for convolutions)

model = tf.keras.models.Sequential([ tf.keras.layers.Input(shape=(28, 28)), #
Explicit input to avoid warning tf.keras.layers.Reshape(target_shape=(28, 28,
1)), tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
tf.keras.layers.MaxPooling2D((2, 2)), tf.keras.layers.Flatten(),
tf.keras.layers.Dense(128, activation='relu'), tf.keras.layers.Dense(10,
activation='softmax') ]) model.compile(optimizer='adam',
loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train on GPU and time it

start = time.time() with tf.device('/GPU:0'): model.fit(x_train, y_train,
epochs=3, batch_size=32) end = time.time() print(f"Training time: {end -
start:.2f} seconds")
```

Now run this in the terminal.

```sh
python test_gpu.py
```

**Example Output**:

```bash
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
I0000 00:00:1756540497.806897   22618 gpu_device.cc:2020] Created device /job:localhost/replica:0/task:0/device:GPU:0 with 6100 MB memory:  -> device: 0, name: NVIDIA GeForce RTX 2060 SUPER, pci bus id: 0000:29:00.0, compute capability: 7.5
Epoch 1/3
I0000 00:00:1756540499.944433   22669 device_compiler.h:196] Compiled cluster using XLA!  This line is logged at most once for the lifetime of the process.
157/157 ━━━━━━━━━━━━━━━━━━━━ 2s 6ms/step - accuracy: 0.8536 - loss: 0.5019
Epoch 2/3
157/157 ━━━━━━━━━━━━━━━━━━━━ 0s 2ms/step - accuracy: 0.9458 - loss: 0.1853
Epoch 3/3
157/157 ━━━━━━━━━━━━━━━━━━━━ 0s 2ms/step - accuracy: 0.9690 - loss: 0.1123
Training time: 3.06 seconds
```

**Expected Results**:

1. Accuracy should start at ~0.80-0.90 in Epoch 1 and reach ~0.95+ by Epoch 3.
2. Loss should drop below 0.5.
3. Training time should remain similar (~2-4 seconds total depending on your
   GPU).

### Development and compilation of new CUDA kernels (optional)

If you plan to build custom CUDA kernels, use NVCC for compiling CUDA code, or
work with other libraries (e.g., PyTorch from source), the `cuda-toolkit` is
essential. TensorFlow's bundled libs are optimized for Ubuntu, but Rocky
(RHEL-based) might have subtle differences in library paths or dependencies.
Installing the official NVIDIA CUDA repo and toolkit ensures version alignment
(e.g., matching your Windows driver's CUDA capability) and avoids potential
runtime errors.

For advanced use-cases, like profiling with `nvprof` or integrating with other
GPU libs (e.g., TensorRT), the `cuda-toolkit` is also a prerequisite.

Scroll down to the [Installation of CUDA toolkit](#installation-of-cuda-toolkit)
section on how to install it.

#### When Can You Skip It?

If you are only going to run pre-built TensorFlow models and don't need
compilation or tools like `nvprof` or `nvidia-smi`, skip this step.

TensorFlow's [and-cuda] pip install (that we ran previously) includes runtime
libraries (CUDA 12.9.79, cuDNN 9.12.0.46), and your Windows NVIDIA driver
handles GPU access.

#### Potential Drawbacks of Installing It

The installation of `cuda-toolkit` adds ~7GB of disk space. If not careful, some
CUDA installers might try to pull in Linux drivers (which is why you must only
install `cuda-toolkit`).

In summary, you "need" this toolkit for a robust setup, especially for tools
like `nvidia-smi` and future-proofing development, but it's not mandatory for
basic TensorFlow GPU acceleration in WSL 2. If your goal is minimalism and it
works without, feel free to skip it and let me know if you run into issues.

#### Installation of CUDA toolkit

Run the following command in your terminal to add the official NVIDIA repository
for Rocky Linux if you haven't already.

```bash
sudo dnf config-manager --add-repo https://developer.download.nvidia.com/compute/cuda/repos/rocky10/x86_64/cuda-rocky10.repo
```

Run the following command to install `cuda-toolkit`. Remember this will add ~7GB
of disk space so it will take some time to download and install.

```bash
sudo dnf install cuda-toolkit -y
```

Run the following commands to correctly link the binaries installed to your
Shell Profile (this works across `bash` and `zsh`).

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' | sudo tee -a /etc/profile.d/cuda.sh
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' | sudo tee -a /etc/profile.d/cuda.sh
source /etc/profile.d/cuda.sh
```

You can now test that this works by running `nvidia-smi` or `nvcc --version` in
the terminal and you should see something similar to this.

Testing `nvidia-smi` command.

```bash
nvidia-smi
```

Example output.

```bash
Sat Aug 30 12:42:10 2025
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.82.02              Driver Version: 581.15         CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 2060 ...    On  |   00000000:29:00.0  On |                  N/A |
| 27%   33C    P8             23W /  215W |    1342MiB /   8192MiB |     10%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
```

Testing `nvcc` command.

```bash
nvcc --version
```

Output:

```bash
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Wed_Jul_16_07:30:01_PM_PDT_2025
Cuda compilation tools, release 13.0, V13.0.48
Build cuda_13.0.r13.0/compiler.36260728_0
```

### Troubleshooting Section

If you get a `tensorflow` error such as
`ModuleNotFoundError: No module named 'tensorflow'` then it is likely that you
forgot to activate the mamba environment.

```bash
mamba activate tf-gpu
```

Re-run your `python` script and check if it is now working.

> Why the Previous Error Occurred:
>
> Mamba/conda environments isolate dependencies, so TensorFlow couldn’t find the
> CUDA libraries. Activating `tf-gpu` fixed this by providing the correct Python
> and library paths.

#### CUDA or cuDDN are not Installed

If you get the following error message where `CUDA` and `cuDNN` shows as not
installed when running the `test_tensorflow_gpu.py` example script from before:

```bash
TensorFlow version: 2.20.0
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
E0000 00:00:1756543706.953610 33084 cuda_executor.cc:1309] INTERNAL: CUDA Runtime error: Failed call to cudaGetRuntimeVersion: Error loading CUDA libraries...
Physical devices: []
CUDA version (from pip): Not installed
cuDNN version (from pip): Not installed
```

You need to ensure that you activated `tf-gpu` in the `mamba` environment.

```bash
mamba activate tf-gpu
```

Rerun the scripts and it should then show that it is detecting the CUDA and
cuDNN versions.

```bash
TensorFlow version: 2.20.0
Physical devices: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
CUDA version (from pip): 12.9.79
cuDNN version (from pip): 9.12.0.46
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
I0000 00:00:1756548775.153678   61490 gpu_device.cc:2020] Created device /job:localhost/replica:0/task:0/device:GPU:0 with 6100 MB memory:  -> device: 0, name: NVIDIA GeForce RTX 2060 SUPER, pci bus id: 0000:29:00.0, compute capability: 7.5
GPU computation result (sum of matrix product): 47088.96
GPU details: PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')
```

#### Check WSL 2 GPU Drivers

Verify WSL GPU passthrough:

```bash
ls -l /usr/lib/wsl/lib
```

Should list `libcuda.so`, `libnvidia-\*.so`, etc. If empty, WSL GPU passthrough
is broken, try reinstalling the latest
[Windows NVIDIA driver](https://www.nvidia.com/en-us/drivers/) and restart your
PC.

Example output should look like this.

```bash
ls -l /usr/lib/wsl/lib
total 389948
-r-xr-xr-x 2 root root  10444456 Aug 22 05:35 libcudadebugger.so.1
-r-xr-xr-x 4 root root    175248 Aug 22 05:35 libcuda.so
-r-xr-xr-x 4 root root    175248 Aug 22 05:35 libcuda.so.1
-r-xr-xr-x 4 root root    175248 Aug 22 05:35 libcuda.so.1.1
-r-xr-xr-x 1 root root   6880344 Oct 20  2023 libd3d12core.so
-r-xr-xr-x 1 root root    801840 Oct 20  2023 libd3d12.so
-r-xr-xr-x 1 root root    942048 Mar 31  2024 libdxcore.so
-r-xr-xr-x 3 root root  20548432 Aug 22 05:35 libnvcuvid.so
-r-xr-xr-x 3 root root  20548432 Aug 22 05:35 libnvcuvid.so.1
-r-xr-xr-x 2 root root 153723328 Aug 22 05:35 libnvdxdlkernels.so
-r-xr-xr-x 3 root root    264328 Aug 22 05:35 libnvidia-encode.so
-r-xr-xr-x 3 root root    264328 Aug 22 05:35 libnvidia-encode.so.1
-r-xr-xr-x 2 root root  72109576 Aug 22 05:35 libnvidia-gpucomp.so
lrwxrwxrwx 1 root root        20 Aug 30 10:00 libnvidia-gpucomp.so.580.82.02 -> libnvidia-gpucomp.so
-r-xr-xr-x 2 root root    266440 Aug 22 05:35 libnvidia-ml.so.1
-r-xr-xr-x 2 root root   4586520 Aug 22 05:35 libnvidia-ngx.so.1
-r-xr-xr-x 3 root root     71760 Aug 22 05:35 libnvidia-opticalflow.so
-r-xr-xr-x 3 root root     71760 Aug 22 05:35 libnvidia-opticalflow.so.1
lrwxrwxrwx 1 root root        15 Aug 30 07:47 libnvoptix_loader.so.1 -> libnvoptix.so.1
-r-xr-xr-x 2 root root     10056 Aug 22 05:35 libnvoptix.so.1
-r-xr-xr-x 2 root root 101362128 Aug 22 05:35 libnvwgf2umx.so
-r-xr-xr-x 2 root root   5018768 Aug 22 05:35 nvidia-ngx-updater
-r-xr-xr-x 2 root root    831864 Aug 22 05:35 nvidia-smi
```

#### Verify NVIDIA Pip Packages

Alternatively, check the `pip` packages and look for
`nvidia-cuda-runtime-cu12==12.3.x`, `nvidia-cudnn-cu12==9.1.x`, etc.

```bash
pip list | grep nvidia
```

Correct output should look similar to this.

```bash
pip list | grep nvidia
nvidia-cublas-cu12       12.9.1.4
nvidia-cuda-cupti-cu12   12.9.79
nvidia-cuda-nvcc-cu12    12.9.86
nvidia-cuda-nvrtc-cu12   12.9.86
nvidia-cuda-runtime-cu12 12.9.79
nvidia-cudnn-cu12        9.12.0.46
nvidia-cufft-cu12        11.4.1.4
nvidia-curand-cu12       10.3.10.19
nvidia-cusolver-cu12     11.7.5.82
nvidia-cusparse-cu12     12.5.10.65
nvidia-nccl-cu12         2.27.7
nvidia-nvjitlink-cu12    12.9.86
```

### Final Notes

Hopefully this got you to a point where Tensorflow now works in your Rocky WSL 2
Linux environment and it should use your Windows GPU.

After confirming that all the functionality works with Python `2.12`, you can
test with a newer Python version (e.g., 3.13.5) as I mentioned in the
[Install Python with pyenv](#install-python-with-pyenv) section.

Replace 3.13.5 with your newer Python version.

```bash
mamba create -n tf-gpu-test python=3.13.5 -c conda-forge -y
mamba activate tf-gpu-test
pip install "tensorflow[and-cuda]==2.20.0"
python test_tensorflow_gpu.py
```

If you are getting a lot of Tensorflow warnings, add the following to your
`~/.bashrc` or `~/.zshrc` file.

```bash
# Disable TensorFlow warnings
export TF_CPP_MIN_LOG_LEVEL=2
```

Reload the shell with the following command.

```bash
source ~/.zshrc # ~/.bashrc for bash
```

Your WSL Rocky Linux environment is now ready for GPU-accelerated machine
learning with TensorFlow.

Happy coding!
