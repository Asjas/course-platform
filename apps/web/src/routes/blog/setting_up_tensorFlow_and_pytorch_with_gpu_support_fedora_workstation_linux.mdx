# Setting Up TensorFlow and PyTorch with GPU Support on Fedora Workstation Linux

This guide walks through setting up TensorFlow and PyTorch with GPU support on
Fedora Workstation 42, leveraging NVIDIA CUDA for machine learning and deep
learning. We'll install system dependencies, use `uv` for Python and package
management, configure the NVIDIA CUDA Toolkit, and verify GPU acceleration. This
assumes you have an NVIDIA GPU with CUDA-capable drivers installed.

## Install System Dependencies for Fedora

To prepare Fedora 42 for TensorFlow, PyTorch, and CUDA, install required
development tools and libraries. These enable building software, installing
drivers, and supporting GPU acceleration.

```bash
sudo dnf upgrade --refresh -y
dnf group list
sudo dnf group install development-tools -y
sudo dnf install tar bzip2 make automake gcc gcc-c++ kernel-devel pciutils elfutils-libelf-devel libglvnd-opengl libglvnd-glx libglvnd-devel pkgconf -y
```

> **Note**: Fedora's `dnf` includes most development tools by default. The
> `kernel-devel` package ensures compatibility with NVIDIA drivers. If you
> encounter missing dependencies, you may need to enable additional repositories
> like RPM Fusion.

## Install Python with uv

For precise control over Python versions, we use `uv` instead of `dnf`. The
`dnf` method installs the latest Python version, which may auto-update and break
compatibility with TensorFlow or PyTorch. UV allows installing specific
versions, which is critical since TensorFlow 2.20.0 officially supports Python
3.9–3.12, and PyTorch supports up to Python 3.12 (as of September 2025). We
recommend Python 3.12 for stability.

### Install uv

Use the official UV installer:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Add UV to your PATH (if not already done by the installer):

```bash
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Shell Autocompletion

Set up `uv` and `uvx` autocompletions for `zsh` (Fedora's default shell for
Workstation):

```bash
echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc
echo 'eval "$(uvx --generate-shell-completion zsh)"' >> ~/.zshrc
source ~/.zshrc
```

For other shells (e.g., `bash`), follow the
[official UV documentation](https://docs.astral.sh/uv/getting-started/installation/#shell-autocompletion).

### Install Python 3.12

Install Python 3.12 using UV:

```bash
uv python install 3.12
```

Pin the specific version (e.g., 3.12.7, check available versions with
`uv python list`):

```bash
uv python pin 3.12.7
```

Verify the Python version:

```bash
uv run python --version
```

**Expected Output**:

```bash
Python 3.12.7
```

### Python Linter and Code Formatter

Optionally, install `ruff` for linting and formatting Python code:

```bash
uv tool install ruff
```

Check or fix code:

```bash
uv run ruff check
uv run ruff check --fix
```

Format code:

```bash
uv run ruff format
```

### Debug UV Installation

If a previous Conda/Mamba installation interferes, deactivate it and reload the
shell:

```bash
conda deactivate
exec zsh
uv python install 3.12
```

### Alternative: Install Python with dnf

If you prefer not to use UV, install Python via DNF, but note it may update
automatically during `dnf upgrade`, potentially breaking compatibility:

```bash
sudo dnf install python3 python3-pip -y
pip3 install --upgrade pip
```

Verify versions:

```bash
python3 --version
pip3 --version
```

## Create UV Virtual Environments

UV manages virtual environments efficiently, replacing the need for Conda/Mamba.
We'll create separate environments for TensorFlow and PyTorch to avoid
dependency conflicts.

### TensorFlow Environment

Create and activate a virtual environment for TensorFlow:

```bash
uv venv tf-gpu
source tf-gpu/bin/activate
```

Install TensorFlow 2.20.0 with CUDA support:

```bash
uv pip install "tensorflow[and-cuda]==2.20.0"
```

Verify installed packages:

```bash
uv pip list | grep -E 'tensorflow|nvidia'
```

**Example Output**:

```bash
nvidia-cublas-cu12           12.9.1.4
nvidia-cuda-cupti-cu12      12.9.79
nvidia-cuda-nvcc-cu12       12.9.86
nvidia-cuda-nvrtc-cu12      12.9.86
nvidia-cuda-runtime-cu12     12.9.79
nvidia-cudnn-cu12           9.12.0.46
nvidia-cufft-cu12           11.4.1.4
nvidia-curand-cu12          10.3.10.19
nvidia-cusolver-cu12        11.7.5.82
nvidia-cusparse-cu12        12.5.10.65
nvidia-nccl-cu12            2.27.7
nvidia-nvjitlink-cu12       12.9.86
tensorflow                  2.20.0
```

### PyTorch Environment

Create and activate a separate virtual environment for PyTorch:

```bash
uv venv torch-gpu
source torch-gpu/bin/activate
```

Install PyTorch with CUDA support (check the
[official PyTorch site](https://pytorch.org/get-started/locally/) for the latest
command, but as of September 2025, this works for CUDA 12.4):

```bash
uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```

Verify installed packages:

```bash
uv pip list | grep -E 'torch|nvidia'
```

**Example Output**:

```bash
torch                       2.5.0+cu124
torchaudio                  2.5.0+cu124
torchvision                 0.20.0+cu124
```

Deactivate the environment when done:

```bash
deactivate
```

## Test TensorFlow GPU Setup

Activate the TensorFlow environment:

```bash
source tf-gpu/bin/activate
```

Verify TensorFlow and GPU detection:

```bash
uv run python -c "import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices('GPU'))"
uv run python -c "import tensorflow as tf; print(tf.__version__); print(tf.config.list_physical_devices('GPU')); print('cuDNN enabled:' if tf.test.is_built_with_cuda() else 'cuDNN not enabled')"
```

### Verbose TensorFlow GPU Verification

For detailed verification, create a test script:

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

```bash
uv run python test_tensorflow_gpu.py
```

**Example Output**:

```bash
TensorFlow version: 2.20.0
Physical devices: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
CUDA version (from pip): 12.9.79
cuDNN version (from pip): 9.12.0.46
GPU computation result (sum of matrix product): -50209.42
GPU details: PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')
```

### Test a Basic TensorFlow Model

Create a test script to confirm GPU usage for model training:

```bash
vi test_tf_model.py
```

Add this content:

```python
import tensorflow as tf
import time

# Load MNIST data
mnist = tf.keras.datasets.mnist
(x_train, y_train), _ = mnist.load_data()
x_train = (x_train[:5000] / 255.0).astype('float32')  # Normalize and cast to float32
y_train = y_train[:5000]

# Simple CNN model (uses cuDNN for convolutions)
model = tf.keras.models.Sequential([
    tf.keras.layers.Input(shape=(28, 28)),  # Explicit input to avoid warning
    tf.keras.layers.Reshape(target_shape=(28, 28, 1)),
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train on GPU and time it
start = time.time()
with tf.device('/GPU:0'):
    model.fit(x_train, y_train, epochs=3, batch_size=32)
end = time.time()
print(f"Training time: {end - start:.2f} seconds")
```

Run the script:

```bash
uv run python test_tf_model.py
```

**Example Output**:

```bash
Epoch 1/3
157/157 [==============================] - 2s 6ms/step - accuracy: 0.8536 - loss: 0.5019
Epoch 2/3
157/157 [==============================] - 0s 2ms/step - accuracy: 0.9458 - loss: 0.1853
Epoch 3/3
157/157 [==============================] - 0s 2ms/step - accuracy: 0.9690 - loss: 0.1123
Training time: 3.06 seconds
```

**Expected Results**:

1. Accuracy should start at ~0.80-0.90 in Epoch 1 and reach ~0.95+ by Epoch 3.
2. Loss should drop below 0.5.
3. Training time should be ~2-4 seconds, depending on your GPU.

## Test PyTorch GPU Setup

Activate the PyTorch environment:

```bash
source torch-gpu/bin/activate
```

Verify PyTorch and GPU detection:

```bash
uv run python -c "import torch; print(torch.__version__); print('CUDA available:', torch.cuda.is_available()); print('GPU device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
```

### Test a Basic PyTorch Model

Create a test script to confirm GPU usage for PyTorch:

```bash
vi test_torch_model.py
```

Add this content:

```python
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
import time

# Load MNIST data
transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
trainset = torchvision.datasets.MNIST(root='./data', train=True, download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=32, shuffle=True, num_workers=2)

# Simple CNN model
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(32 * 13 * 13, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = x.view(-1, 32 * 13 * 13)
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Initialize model, loss, and optimizer
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
model = Net().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters())

# Train on GPU and time it
start = time.time()
model.train()
for epoch in range(3):
    running_loss = 0.0
    for i, data in enumerate(trainloader, 0):
        inputs, labels = data[0].to(device), data[1].to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
    print(f'Epoch {epoch + 1}, Loss: {running_loss / len(trainloader):.4f}')
end = time.time()
print(f'Training time: {end - start:.2f} seconds')
```

Run the script:

```bash
uv run python test_torch_model.py
```

**Example Output**:

```bash
Epoch 1, Loss: 0.3056
Epoch 2, Loss: 0.0987
Epoch 3, Loss: 0.0674
Training time: 15.23 seconds
```

**Expected Results**:

1. Loss should decrease steadily, reaching ~0.05-0.10 by Epoch 3.
2. Training time should be ~10-20 seconds, depending on your GPU and dataset
   size.

## Installation of CUDA Toolkit (Optional)

For compiling custom CUDA kernels, using `nvcc`, or tools like `nvidia-smi`,
install the NVIDIA CUDA Toolkit. TensorFlow and PyTorch's pip packages include
runtime libraries (e.g., CUDA 12.9 for TensorFlow, CUDA 12.4 for PyTorch), so
this is only needed for advanced use cases.

### When Can You Skip It?

If you only run pre-built models and don't need compilation or tools like
`nvidia-smi`, skip this step. The `tensorflow[and-cuda]` and PyTorch pip
installs include necessary runtime libraries, and your NVIDIA driver handles GPU
access.

### Potential Drawbacks

The CUDA Toolkit adds ~7GB of disk space and may take time to install.

### Install CUDA Toolkit

Add the NVIDIA CUDA repository for Fedora:

```bash
sudo dnf config-manager --add-repo https://developer.download.nvidia.com/compute/cuda/repos/fedora40/x86_64/cuda-fedora40.repo
```

Install the CUDA Toolkit:

```bash
sudo dnf install cuda-toolkit -y
```

Link binaries to your shell profile:

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' | sudo tee -a /etc/profile.d/cuda.sh
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' | sudo tee -a /etc/profile.d/cuda.sh
source /etc/profile.d/cuda.sh
```

Verify installation:

```bash
nvidia-smi
nvcc --version
```

**Example Output** (nvidia-smi):

```bash
Sat Sep 13 10:51:00 2025
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 555.42.06    Driver Version: 555.42.06    CUDA Version: 12.5            |
|-------------------------------+----------------------+------------------------------|
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC        |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M.        |
|-------------------------------+----------------------+------------------------------|
|   0  NVIDIA GeForce RTX 3060  Off  | 00000000:01:00.0 Off |                  N/A       |
| 30%   35C    P8    20W / 170W |    500MiB / 12288MiB |      0%      Default        |
+-------------------------------+----------------------+------------------------------+
```

**Example Output** (nvcc):

```bash
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Mon_Apr_10_12:25:35_PDT_2025
Cuda compilation tools, release 12.5, V12.5.40
```

## Troubleshooting

### TensorFlow/PyTorch Module Not Found

If you get `ModuleNotFoundError: No module named 'tensorflow'` or `'torch'`,
ensure the correct environment is activated:

```bash
source tf-gpu/bin/activate  # For TensorFlow
source torch-gpu/bin/activate  # For PyTorch
```

Rerun your script.

### CUDA or cuDNN Not Detected

If GPU detection fails (e.g., `Physical devices: []` for TensorFlow or
`CUDA available: False` for PyTorch):

1. Verify the environment is activated.
2. Check NVIDIA driver installation:

```bash
nvidia-smi
```

If it fails, reinstall the NVIDIA driver for Fedora via RPM Fusion:

```bash
sudo dnf install akmod-nvidia
sudo dnf install xorg-x11-drv-nvidia-cuda
```

3. Reinstall the packages:

```bash
uv pip install --force-reinstall "tensorflow[and-cuda]==2.20.0"  # For tf-gpu
uv pip install --force-reinstall torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124  # For torch-gpu
```

### Verify NVIDIA Pip Packages

Check installed NVIDIA libraries:

```bash
uv pip list | grep nvidia
```

Ensure versions match the expected CUDA/cuDNN versions (e.g.,
`nvidia-cuda-runtime-cu12==12.9.79`, `nvidia-cudnn-cu12==9.12.0.46` for
TensorFlow).

## Final Notes

Your Fedora Workstation 42 is now set up for GPU-accelerated machine learning
with TensorFlow and PyTorch using UV. To test newer Python versions (e.g.,
3.13), create a new environment:

```bash
uv venv tf-gpu-test
source tf-gpu-test/bin/activate
uv python install 3.13
uv pip install "tensorflow[and-cuda]==2.20.0"
uv run python test_tensorflow_gpu.py
```

For PyTorch:

```bash
uv venv torch-gpu-test
source torch-gpu-test/bin/activate
uv python install 3.13
uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
uv run python test_torch_model.py
```

To suppress TensorFlow warnings, add to `~/.zshrc`:

```bash
export TF_CPP_MIN_LOG_LEVEL=2
```

Reload the shell:

```bash
source ~/.zshrc
```

Happy coding!
