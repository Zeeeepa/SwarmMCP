from setuptools import setup, find_packages

setup(
    name="unified-mcp-client",
    version="0.1.0",
    description="Python client for the Unified MCP Server",
    author="Zambe",
    author_email="info@zambe.ai",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "python-socketio>=5.0.0",
    ],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
)

