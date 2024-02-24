.PHONY: all omnilock anyone-can-pay

all: omnilock anyone-can-pay xudt

omnilock:
	@echo "Building omnilock via submodule"
	cd docker/omnilock && git submodule update --init && make all-via-docker
	cp docker/omnilock/build/always_success docker/ckb/specs/
	cp docker/omnilock/build/omni_lock docker/ckb/specs/

anyone-can-pay:
	@echo "Building anyone-can-pay via submodule"
	cd docker/anyone-can-pay && git submodule update --init && make all-via-docker
	cp docker/anyone-can-pay/build/anyone_can_pay docker/ckb/specs/

xudt:
	@echo "Building xUDT via submodule"
	cd docker/ckb-production-scripts && git submodule update --init && make all-via-docker
	cp docker/ckb-production-scripts/build/xudt_rce docker/ckb/specs/
	cp docker/ckb-production-scripts/build/simple_udt docker/ckb/specs/sudt
